package services

import (
	"context"
	"fmt"

	"github.com/supabase-community/supabase-go"
	"github.com/rs/zerolog/log"

	"educore-api/internal/config"
	"educore-api/internal/models"
	"educore-api/internal/utils"
)

// SupabaseService handles all Supabase database interactions
type SupabaseService struct {
	cfg    *config.Config
	client *supabase.Client
}

// NewSupabaseService creates a new Supabase service
func NewSupabaseService(cfg *config.Config) (*SupabaseService, error) {
	client, err := supabase.NewClient(cfg.Supabase.URL, cfg.Supabase.ServiceRoleKey, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Supabase client: %w", err)
	}

	return &SupabaseService{
		cfg:    cfg,
		client: client,
	}, nil
}

// GetMasterSeed retrieves and decrypts the master seed from Supabase Vault
func (s *SupabaseService) GetMasterSeed(ctx context.Context) ([]byte, error) {
	// In production, use Supabase Vault API to retrieve encrypted secret
	// For MVP, we'll use a direct database query to a vault table
	// Supabase Vault: https://supabase.com/docs/guides/database/vault
	
	// This is a placeholder - actual implementation depends on Supabase Vault setup
	// The vault stores the master seed encrypted, we retrieve and decrypt it
	
	return nil, fmt.Errorf("not implemented - requires Supabase Vault integration")
}

// CreateInstitution creates a new institution record
func (s *SupabaseService) CreateInstitution(ctx context.Context, inst *models.Institution) error {
	_, err := s.client.From("institutions").Insert(inst).Execute()
	if err != nil {
		return fmt.Errorf("failed to create institution: %w", err)
	}
	return nil
}

// GetInstitutionByID fetches an institution by ID
func (s *SupabaseService) GetInstitutionByID(ctx context.Context, id string) (*models.Institution, error) {
	var result []models.Institution
	err := s.client.From("institutions").Select("*").Eq("id", id).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get institution: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("institution not found")
	}
	return &result[0], nil
}

// GetInstitutionByCNPJ fetches an institution by CNPJ
func (s *SupabaseService) GetInstitutionByCNPJ(ctx context.Context, cnpj string) (*models.Institution, error) {
	var result []models.Institution
	err := s.client.From("institutions").Select("*").Eq("cnpj", cnpj).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get institution by CNPJ: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("institution not found")
	}
	return &result[0], nil
}

// GetInstitutionBySolanaPubkey fetches an institution by Solana pubkey
func (s *SupabaseService) GetInstitutionBySolanaPubkey(ctx context.Context, pubkey string) (*models.Institution, error) {
	var result []models.Institution
	err := s.client.From("institutions").Select("*").Eq("solana_pubkey", pubkey).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get institution by pubkey: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("institution not found")
	}
	return &result[0], nil
}

// ListInstitutions lists all active institutions
func (s *SupabaseService) ListInstitutions(ctx context.Context) ([]models.Institution, error) {
	var result []models.Institution
	err := s.client.From("institutions").Select("*").Eq("is_active", true).Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to list institutions: %w", err)
	}
	return result, nil
}

// CreateStudent creates a new student with derived wallet
func (s *SupabaseService) CreateStudent(ctx context.Context, student *models.Student) error {
	_, err := s.client.From("students").Insert(student).Execute()
	if err != nil {
		return fmt.Errorf("failed to create student: %w", err)
	}
	return nil
}

// GetStudentByID fetches a student by ID
func (s *SupabaseService) GetStudentByID(ctx context.Context, id string) (*models.Student, error) {
	var result []models.Student
	err := s.client.From("students").Select("*").Eq("id", id).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get student: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("student not found")
	}
	return &result[0], nil
}

// GetStudentByCPF fetches a student by CPF
func (s *SupabaseService) GetStudentByCPF(ctx context.Context, cpf string) (*models.Student, error) {
	var result []models.Student
	err := s.client.From("students").Select("*").Eq("cpf", cpf).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get student by CPF: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("student not found")
	}
	return &result[0], nil
}

// GetStudentByEmail fetches a student by email
func (s *SupabaseService) GetStudentByEmail(ctx context.Context, email string) (*models.Student, error) {
	var result []models.Student
	err := s.client.From("students").Select("*").Eq("email", email).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get student by email: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("student not found")
	}
	return &result[0], nil
}

// UpdateStudentWallet updates the student's custodial wallet pubkey
func (s *SupabaseService) UpdateStudentWallet(ctx context.Context, studentID string, walletPubkey string) error {
	_, err := s.client.From("students").Update(map[string]interface{}{
		"solana_wallet_custodial": walletPubkey,
		"updated_at":              "now()",
	}).Eq("id", studentID).Execute()
	if err != nil {
		return fmt.Errorf("failed to update student wallet: %w", err)
	}
	return nil
}

// CreateAcademicRecord creates a new academic record
func (s *SupabaseService) CreateAcademicRecord(ctx context.Context, record *models.AcademicRecord) error {
	_, err := s.client.From("academic_records").Insert(record).Execute()
	if err != nil {
		return fmt.Errorf("failed to create academic record: %w", err)
	}
	return nil
}

// GetAcademicRecordByHash fetches an academic record by document hash
func (s *SupabaseService) GetAcademicRecordByHash(ctx context.Context, hash string) (*models.AcademicRecord, error) {
	var result []models.AcademicRecord
	err := s.client.From("academic_records").Select("*").Eq("document_hash", hash).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get academic record by hash: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("academic record not found")
	}
	return &result[0], nil
}

// GetAcademicRecordByTxSignature fetches an academic record by Solana tx signature
func (s *SupabaseService) GetAcademicRecordByTxSignature(ctx context.Context, sig string) (*models.AcademicRecord, error) {
	var result []models.AcademicRecord
	err := s.client.From("academic_records").Select("*").Eq("solana_tx_signature", sig).Single().Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get academic record by tx: %w", err)
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("academic record not found")
	}
	return &result[0], nil
}

// GetStudentRecords fetches all academic records for a student
func (s *SupabaseService) GetStudentRecords(ctx context.Context, studentID string) ([]models.AcademicRecord, error) {
	var result []models.AcademicRecord
	err := s.client.From("academic_records").Select("*").Eq("student_id", studentID).Order("issued_at", &supabase.OrderOptions{Ascending: false}).Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get student records: %w", err)
	}
	return result, nil
}

// GetInstitutionRecords fetches all academic records for an institution
func (s *SupabaseService) GetInstitutionRecords(ctx context.Context, institutionID string) ([]models.AcademicRecord, error) {
	var result []models.AcademicRecord
	err := s.client.From("academic_records").Select("*").Eq("institution_id", institutionID).Order("issued_at", &supabase.OrderOptions{Ascending: false}).Execute(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to get institution records: %w", err)
	}
	return result, nil
}

// VerifyDocumentHash checks if a document hash exists in the database
func (s *SupabaseService) VerifyDocumentHash(ctx context.Context, hash string) (*models.VerifyPDFResponse, error) {
	record, err := s.GetAcademicRecordByHash(ctx, hash)
	if err != nil {
		return &models.VerifyPDFResponse{
			Valid:        false,
			DocumentHash: hash,
			Error:        "Document not found in database",
		}, nil
	}

	// Fetch institution name
	inst, _ := s.GetInstitutionByID(ctx, record.InstitutionID.String())
	instName := ""
	if inst != nil {
		instName = inst.Name
	}

	return &models.VerifyPDFResponse{
		Valid:            true,
		DocumentHash:     record.DocumentHash,
		SolanaTxSignature: record.SolanaTxSignature,
		InstitutionName:  instName,
		DocumentType:     string(record.DocumentType),
		IssuedAt:         record.IssuedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}

// LogVerification logs a verification attempt for audit
func (s *SupabaseService) LogVerification(ctx context.Context, documentHash, verifierIP, result string) error {
	_, err := s.client.From("verification_logs").Insert(map[string]interface{}{
		"document_hash": documentHash,
		"verifier_ip":   verifierIP,
		"result":        result,
		"created_at":    "now()",
	}).Execute()
	return err
}