package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/rs/zerolog/log"

	"github.com/educore-latteschain/api/internal/config"
	"github.com/educore-latteschain/api/internal/models"
)

// SolanaService handles all Solana blockchain interactions
type SolanaService struct {
	cfg         *config.Config
	heliusClient *rpc.Client
	quickNodeClient *rpc.Client
	httpClient  *http.Client
}

// NewSolanaService creates a new Solana service with primary and fallback RPC
func NewSolanaService(cfg *config.Config) (*SolanaService, error) {
	var heliusClient, quickNodeClient *rpc.Client
	var err error

	if cfg.Solana.HeliusRPCURL != "" {
		heliusClient = rpc.New(cfg.Solana.HeliusRPCURL)
	}
	
	if cfg.Solana.QuickNodeRPCURL != "" {
		quickNodeClient = rpc.New(cfg.Solana.QuickNodeRPCURL)
	}

	if heliusClient == nil && quickNodeClient == nil {
		return nil, fmt.Errorf("no RPC client configured")
	}

	return &SolanaService{
		cfg:            cfg,
		heliusClient:   heliusClient,
		quickNodeClient: quickNodeClient,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

// GetPrimaryClient returns the primary RPC client (Helius)
func (s *SolanaService) GetPrimaryClient() *rpc.Client {
	if s.heliusClient != nil {
		return s.heliusClient
	}
	return s.quickNodeClient
}

// GetFallbackClient returns the fallback RPC client
func (s *SolanaService) GetFallbackClient() *rpc.Client {
	if s.heliusClient != nil && s.quickNodeClient != nil {
		return s.quickNodeClient
	}
	return s.heliusClient
}

// ExecuteWithFallback executes an RPC call with automatic fallback
func (s *SolanaService) ExecuteWithFallback(ctx context.Context, fn func(*rpc.Client) error) error {
	primary := s.GetPrimaryClient()
	if primary != nil {
		if err := fn(primary); err == nil {
			return nil
		}
		log.Warn().Err(err).Msg("Primary RPC failed, trying fallback")
	}

	fallback := s.GetFallbackClient()
	if fallback != nil {
		return fn(fallback)
	}

	return fmt.Errorf("no RPC clients available")
}

// GetMasterRegistry fetches the Master Registry account
func (s *SolanaService) GetMasterRegistry(ctx context.Context) (*models.MasterRegistryAccount, error) {
	programID := solana.MustPublicKeyFromBase58(s.cfg.Solana.ProgramID)
	
	// Derive MasterRegistry PDA
	seeds := [][]byte{[]byte("master_registry")}
	pda, _, err := solana.FindProgramAddress(seeds, programID)
	if err != nil {
		return nil, fmt.Errorf("failed to find MasterRegistry PDA: %w", err)
	}

	account, err := s.GetPrimaryClient().GetAccountInfo(ctx, pda)
	if err != nil {
		return nil, fmt.Errorf("failed to get MasterRegistry account: %w", err)
	}

	if account.Value == nil {
		return nil, fmt.Errorf("MasterRegistry account not found")
	}

	// Parse account data (simplified - use proper Anchor deserialization in production)
	return &models.MasterRegistryAccount{
		Pubkey:    pda,
		Authority: solana.PublicKeyFromBytes(account.Value.Data.GetBinary()[8:40]),
		Bump:      account.Value.Data.GetBinary()[40],
	}, nil
}

// GetUniversityRecord fetches a University Record by institution pubkey
func (s *SolanaService) GetUniversityRecord(ctx context.Context, institutionPubkey solana.PublicKey) (*models.UniversityRecordAccount, error) {
	programID := solana.MustPublicKeyFromBase58(s.cfg.Solana.ProgramID)
	
	seeds := [][]byte{[]byte("university_record"), institutionPubkey.Bytes()}
	pda, _, err := solana.FindProgramAddress(seeds, programID)
	if err != nil {
		return nil, fmt.Errorf("failed to find UniversityRecord PDA: %w", err)
	}

	account, err := s.GetPrimaryClient().GetAccountInfo(ctx, pda)
	if err != nil {
		return nil, fmt.Errorf("failed to get UniversityRecord account: %w", err)
	}

	if account.Value == nil {
		return nil, fmt.Errorf("UniversityRecord account not found")
	}

	data := account.Value.Data.GetBinary()
	if len(data) < 44 {
		return nil, fmt.Errorf("account data too short: %d bytes", len(data))
	}
	instPubkey := solana.PublicKeyFromBytes(data[8:40])

	// Read CNPJ length (4 bytes little endian) and data
	cnpjLen := int(data[40]) | int(data[41])<<8 | int(data[42])<<16 | int(data[43])<<24
	offset := 44
	if len(data) < offset+cnpjLen+4 {
		return nil, fmt.Errorf("corrupted account data for CNPJ (len: %d)", cnpjLen)
	}
	cnpjStr := string(data[offset : offset+cnpjLen])
	offset += cnpjLen

	// Read Name length and skip name bytes
	nameLen := int(data[offset]) | int(data[offset+1])<<8 | int(data[offset+2])<<16 | int(data[offset+3])<<24
	offset += 4
	if len(data) < offset+nameLen+2 {
		return nil, fmt.Errorf("corrupted account data for Name (len: %d)", nameLen)
	}
	offset += nameLen

	isActive := data[offset] == 1
	bump := data[offset+1]

	return &models.UniversityRecordAccount{
		Pubkey:            pda,
		InstitutionPubkey: instPubkey,
		CNPJ:              cnpjStr,
		IsActive:          isActive,
		Bump:              bump,
	}, nil
}

// LogAcademicEvent sends a transaction to log an academic event via SPL Memo
func (s *SolanaService) LogAcademicEvent(ctx context.Context, institutionPubkey solana.PublicKey, documentHash string, icpSignature string) (string, error) {
	// For MVP: Use SPL Memo program to log the event
	// In production: Use Anchor instruction via program
	
	memoData := fmt.Sprintf("EduCore:%s:%s:%s", institutionPubkey.String(), documentHash, icpSignature)
	
	// Build transaction with SPL Memo instruction
	memoProgramID := solana.MustPublicKeyFromBase58("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo")
	
	// This is a simplified version - production should use proper transaction building
	// with the Anchor program's log_academic_event instruction
	
	return "", fmt.Errorf("not implemented - use Anchor program instruction")
}

// MintMetaplexCoreSBT mints a Metaplex Core SBT (Non-Transferable) for a diploma
func (s *SolanaService) MintMetaplexCoreSBT(ctx context.Context, studentPubkey solana.PublicKey, metadataURI string, name string) (string, error) {
	// Metaplex Core program ID (Mainnet)
	coreProgramID := solana.MustPublicKeyFromBase58("CoREENxT6tW1HoK8ypY1SxRMZjVPm7xRk51t3G14eYTV")
	
	// This requires the Metaplex Core SDK or manual instruction building
	// For MVP, we'll return a placeholder
	// Production: Use @metaplex-foundation/mpl-core-candy-machine or direct instructions
	
	return "", fmt.Errorf("not implemented - requires Metaplex Core SDK integration")
}

// GetStudentAssets fetches all Metaplex Core assets owned by a student via Helius DAS API
func (s *SolanaService) GetStudentAssets(ctx context.Context, studentPubkey solana.PublicKey) (*models.HeliusDASResponse, error) {
	if s.heliusClient == nil {
		return nil, fmt.Errorf("Helius client not configured (required for DAS API)")
	}

	// Helius DAS API endpoint
	url := fmt.Sprintf("%s/v0/assets/owner/%s", s.cfg.Solana.HeliusRPCURL, studentPubkey.String())
	
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("DAS API returned status %d", resp.StatusCode)
	}
	
	var result models.HeliusDASResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// VerifyDocumentOnChain verifies a document hash exists on-chain
func (s *SolanaService) VerifyDocumentOnChain(ctx context.Context, documentHash string) (*models.VerifyPDFResponse, error) {
	// Query the Anchor program for the event or account
	// This is simplified - production should use proper event parsing or account lookup
	
	// Option 1: Search transaction history for SPL Memo with hash
	// Option 2: Query program accounts for AcademicRecord PDA
	// Option 3: Use Helius Enhanced Transactions API
	
	return &models.VerifyPDFResponse{
		Valid:        false,
		DocumentHash: documentHash,
		Error:        "not implemented - requires event/account indexing",
	}, nil
}

// SendTransaction sends a signed transaction with fallback
func (s *SolanaService) SendTransaction(ctx context.Context, tx *solana.Transaction) (string, error) {
	var sig solana.Signature
	var err error
	
	err = s.ExecuteWithFallback(ctx, func(client *rpc.Client) error {
		sig, err = client.SendTransaction(ctx, tx)
		return err
	})
	
	if err != nil {
		return "", err
	}
	
	return sig.String(), nil
}

// ConfirmTransaction confirms a transaction with commitment
func (s *SolanaService) ConfirmTransaction(ctx context.Context, signature string) error {
	sig := solana.MustSignatureFromBase58(signature)
	
	return s.ExecuteWithFallback(ctx, func(client *rpc.Client) error {
		_, err := client.ConfirmTransaction(ctx, sig, rpc.CommitmentFinalized)
		return err
	})
}