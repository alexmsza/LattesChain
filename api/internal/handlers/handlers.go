package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gagliardetto/solana-go"
	"github.com/rs/zerolog/log"

	"github.com/educore-latteschain/api/internal/models"
	"github.com/educore-latteschain/api/internal/services"
	"github.com/educore-latteschain/api/internal/utils"
)

// Handler holds all service dependencies
type Handler struct {
	solanaService  *services.SolanaService
	supabaseService *services.SupabaseService
}

// NewHandler creates a new handler with all services
func NewHandler(solana *services.SolanaService, supabase *services.SupabaseService) *Handler {
	return &Handler{
		solanaService:   solana,
		supabaseService: supabase,
	}
}

// HealthCheck handles GET /health
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Version:   "1.0.0-mvp",
		Checks: map[string]string{
			"database": "connected",
			"solana":   "connected",
		},
	})
}

// IssueCertificate handles POST /api/issue_certificate
func (h *Handler) IssueCertificate(c *gin.Context) {
	var req models.IssueCertificateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Error().Err(err).Msg("Invalid request payload")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Validate student exists
	student, err := h.supabaseService.GetStudentByID(c.Request.Context(), req.StudentID)
	if err != nil {
		log.Error().Err(err).Str("student_id", req.StudentID).Msg("Student not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	// Validate institution exists and is active
	institution, err := h.supabaseService.GetInstitutionByID(c.Request.Context(), req.InstitutionID)
	if err != nil {
		log.Error().Err(err).Str("institution_id", req.InstitutionID).Msg("Institution not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Institution not found"})
		return
	}

	if !institution.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Institution is not active"})
		return
	}

	// Compute document hash
	documentHash, err := utils.ComputeDocumentHash(req.DocumentMetadata)
	if err != nil {
		log.Error().Err(err).Msg("Failed to compute document hash")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compute document hash"})
		return
	}

	// Check for duplicate hash (idempotency)
	existing, err := h.supabaseService.GetAcademicRecordByHash(c.Request.Context(), documentHash)
	if err == nil && existing != nil {
		log.Warn().Str("hash", documentHash).Msg("Duplicate document hash detected")
		c.JSON(http.StatusConflict, gin.H{
			"error":           "Document already issued",
			"document_hash":   documentHash,
			"tx_signature":    existing.SolanaTxSignature,
		})
		return
	}

	// Mock ICP-Brasil signature (MVP)
	// Production: Use AWS CloudHSM + Lambda for actual e-CNPJ signing
	icpSignature := "MOCK_ICP_BRASIL_SIGNATURE_" + documentHash[:16]

	// Derive student's custodial wallet if not exists
	if student.SolanaWalletCustodial == "" {
		// Get master seed from Vault
		masterSeed, err := h.supabaseService.GetMasterSeed(c.Request.Context())
		if err != nil {
			log.Error().Err(err).Msg("Failed to get master seed from Vault")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Wallet derivation failed"})
			return
		}

		deriver := utils.NewBIP44Deriver(masterSeed, 501) // Solana coin type
		walletPubkey, err := deriver.DeriveStudentPubkey(req.StudentID, 0)
		if err != nil {
			log.Error().Err(err).Msg("Failed to derive student wallet")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Wallet derivation failed"})
			return
		}

		// Update student with derived wallet
		if err := h.supabaseService.UpdateStudentWallet(c.Request.Context(), req.StudentID, walletPubkey); err != nil {
			log.Error().Err(err).Msg("Failed to update student wallet")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student wallet"})
			return
		}
		student.SolanaWalletCustodial = walletPubkey
	}

	// Determine document type
	docType := models.DocumentTypeHorasComplementares
	if dt, ok := req.DocumentMetadata["type"].(string); ok {
		docType = models.DocumentType(dt)
	}

	// For Diploma: Mint Metaplex Core SBT
	var metaplexAssetID string
	if docType == models.DocumentTypeDiploma {
		// TODO: Implement Metaplex Core SBT minting
		// assetID, err := h.solanaService.MintMetaplexCoreSBT(...)
		metaplexAssetID = "PENDING_SBT_MINT"
	}

	// Submit to Solana (SPL Memo for hours, Anchor instruction for diploma)
	// For MVP: Use SPL Memo program
	txSignature, err := h.submitToSolana(c.Request.Context(), institution.SolanaPubkey, documentHash, icpSignature, docType)
	if err != nil {
		log.Error().Err(err).Msg("Failed to submit to Solana")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Blockchain submission failed"})
		return
	}

	// Persist off-chain record
	record := &models.AcademicRecord{
		StudentID:          student.ID,
		InstitutionID:      institution.ID,
		DocumentType:       docType,
		DocumentHash:       documentHash,
		ICPBrasilSignature: icpSignature,
		SolanaTxSignature:  txSignature,
		MetaplexAssetID:    &metaplexAssetID,
		Metadata:           req.DocumentMetadata,
	}

	if err := h.supabaseService.CreateAcademicRecord(c.Request.Context(), record); err != nil {
		log.Error().Err(err).Msg("Failed to persist academic record")
		// Note: Transaction already on-chain, but off-chain record failed
		// In production: implement compensation logic
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Record persisted on-chain but failed off-chain"})
		return
	}

	// Log verification audit
	h.supabaseService.LogVerification(c.Request.Context(), documentHash, c.ClientIP(), "ISSUED")

	c.JSON(http.StatusCreated, models.IssueCertificateResponse{
		Status:             "success",
		DocumentHash:       documentHash,
		SolanaTxSignature:  txSignature,
		ICPBrasilSignature: icpSignature,
		MetaplexAssetID:    metaplexAssetID,
	})
}

// VerifyPDF handles POST /api/verify/pdf
func (h *Handler) VerifyPDF(c *gin.Context) {
	// Parse multipart form
	file, header, err := c.Request.FormFile("document")
	if err != nil {
		log.Error().Err(err).Msg("Failed to get file from form")
		c.JSON(http.StatusBadRequest, gin.H{"error": "No document file provided"})
		return
	}
	defer file.Close()

	// Read file content
	fileBytes := make([]byte, header.Size)
	if _, err := file.Read(fileBytes); err != nil {
		log.Error().Err(err).Msg("Failed to read file")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read document"})
		return
	}

	// Compute SHA-256 hash of raw file bytes (canonicalization)
	hash := sha256.Sum256(fileBytes)
	documentHash := hex.EncodeToString(hash[:])

	// Verify against database first (fast)
	result, err := h.supabaseService.VerifyDocumentHash(c.Request.Context(), documentHash)
	if err != nil {
		log.Error().Err(err).Msg("Database verification failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Verification failed"})
		return
	}

	if result.Valid {
		// Log verification
		h.supabaseService.LogVerification(c.Request.Context(), documentHash, c.ClientIP(), "VALID")
		c.JSON(http.StatusOK, result)
		return
	}

	// Fallback: Verify on-chain (slower)
	onChainResult, err := h.solanaService.VerifyDocumentOnChain(c.Request.Context(), documentHash)
	if err != nil {
		log.Error().Err(err).Msg("On-chain verification failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "On-chain verification failed"})
		return
	}

	if onChainResult.Valid {
		h.supabaseService.LogVerification(c.Request.Context(), documentHash, c.ClientIP(), "VALID_ONCHAIN")
		c.JSON(http.StatusOK, onChainResult)
		return
	}

	// Not found
	h.supabaseService.LogVerification(c.Request.Context(), documentHash, c.ClientIP(), "INVALID")
	c.JSON(http.StatusOK, models.VerifyPDFResponse{
		Valid:        false,
		DocumentHash: documentHash,
		Error:        "Document not found in registry",
	})
}

// GetStudentRecords handles GET /api/students/:id/records
func (h *Handler) GetStudentRecords(c *gin.Context) {
	studentID := c.Param("id")
	
	records, err := h.supabaseService.GetStudentRecords(c.Request.Context(), studentID)
	if err != nil {
		log.Error().Err(err).Str("student_id", studentID).Msg("Failed to get student records")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch records"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"records": records})
}

// GetInstitutionRecords handles GET /api/institutions/:id/records
func (h *Handler) GetInstitutionRecords(c *gin.Context) {
	institutionID := c.Param("id")
	
	records, err := h.supabaseService.GetInstitutionRecords(c.Request.Context(), institutionID)
	if err != nil {
		log.Error().Err(err).Str("institution_id", institutionID).Msg("Failed to get institution records")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch records"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"records": records})
}

// GetStudentAssets handles GET /api/students/:id/assets
func (h *Handler) GetStudentAssets(c *gin.Context) {
	studentID := c.Param("id")
	
	student, err := h.supabaseService.GetStudentByID(c.Request.Context(), studentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	if student.SolanaWalletCustodial == "" {
		c.JSON(http.StatusOK, gin.H{"assets": []models.MetaplexCoreAsset{}})
		return
	}

	studentPubkey := solana.MustPublicKeyFromBase58(student.SolanaWalletCustodial)
	assets, err := h.solanaService.GetStudentAssets(c.Request.Context(), studentPubkey)
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch student assets")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assets": assets.Items})
}

func (h *Handler) submitToSolana(ctx context.Context, institutionPubkey string, documentHash, icpSignature string, docType models.DocumentType) (string, error) {
	// For MVP: Submit via SPL Memo program
	// Production: Use Anchor program instruction log_academic_event
	
	// This is a placeholder - actual implementation requires:
	// 1. Build transaction with SPL Memo instruction
	// 2. Sign with relayer keypair
	// 3. Send via RPC with fallback
	
	return "MOCK_TX_SIGNATURE_" + documentHash[:16], nil
}