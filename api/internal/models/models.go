package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/gagliardetto/solana-go"
)

// Institution represents an educational institution (IES) registered in the system
type Institution struct {
	ID             uuid.UUID `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	CNPJ           string    `json:"cnpj" db:"cnpj"`
	SolanaPubkey   string    `json:"solana_pubkey" db:"solana_pubkey"`
	IsVerified     bool      `json:"is_verified" db:"is_verified"`
	IsActive       bool      `json:"is_active" db:"is_active"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

// Student represents a student with custodial wallet derived from Supabase Vault
type Student struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	CPF                   string     `json:"cpf" db:"cpf"`
	FullName              string     `json:"full_name" db:"full_name"`
	Email                 string     `json:"email" db:"email"`
	SolanaWalletCustodial string     `json:"solana_wallet_custodial" db:"solana_wallet_custodial"`
	BIP44Index            uint32     `json:"bip44_index" db:"bip44_index"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt             *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

// AcademicRecord represents an issued academic document (diploma, certificate, hours)
type AcademicRecord struct {
	ID                  uuid.UUID              `json:"id" db:"id"`
	StudentID           uuid.UUID              `json:"student_id" db:"student_id"`
	InstitutionID       uuid.UUID              `json:"institution_id" db:"institution_id"`
	DocumentType        DocumentType           `json:"document_type" db:"document_type"`
	DocumentHash        string                 `json:"document_hash" db:"document_hash"`
	ICPBrasilSignature  string                 `json:"icp_brasil_signature" db:"icp_brasil_signature"`
	SolanaTxSignature   string                 `json:"solana_tx_signature" db:"solana_tx_signature"`
	MetaplexAssetID     *string                `json:"metaplex_asset_id,omitempty" db:"metaplex_asset_id"`
	Metadata            map[string]interface{} `json:"metadata" db:"metadata"`
	IssuedAt            time.Time              `json:"issued_at" db:"issued_at"`
	CreatedAt           time.Time              `json:"created_at" db:"created_at"`
}

// DocumentType represents the type of academic document
type DocumentType string

const (
	DocumentTypeDiploma              DocumentType = "DIPLOMA"
	DocumentTypeHorasComplementares  DocumentType = "HORAS_COMPLEMENTARES"
	DocumentTypeCertificadoCurso     DocumentType = "CERTIFICADO_CURSO"
	DocumentTypeHistoricoEscolar     DocumentType = "HISTORICO_ESCOLAR"
)

// IssueCertificateRequest represents the request to issue a certificate
type IssueCertificateRequest struct {
	StudentID        string                 `json:"student_id" binding:"required,uuid"`
	InstitutionID    string                 `json:"institution_id" binding:"required,uuid"`
	DocumentMetadata map[string]interface{} `json:"document_metadata" binding:"required"`
}

// IssueCertificateResponse represents the response after issuing a certificate
type IssueCertificateResponse struct {
	Status              string `json:"status"`
	DocumentHash        string `json:"document_hash"`
	SolanaTxSignature   string `json:"solana_tx_signature"`
	ICPBrasilSignature  string `json:"icp_signature"`
	MetaplexAssetID     string `json:"metaplex_asset_id,omitempty"`
}

// VerifyPDFRequest represents the request to verify a PDF
type VerifyPDFRequest struct {
	// multipart/form-data with file field "document"
}

// VerifyPDFResponse represents the response from PDF verification
type VerifyPDFResponse struct {
	Valid               bool   `json:"valid"`
	DocumentHash        string `json:"document_hash"`
	SolanaTxSignature   string `json:"solana_tx_signature,omitempty"`
	InstitutionName     string `json:"institution_name,omitempty"`
	DocumentType        string `json:"document_type,omitempty"`
	IssuedAt            string `json:"issued_at,omitempty"`
	Error               string `json:"error,omitempty"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Version   string            `json:"version"`
	Checks    map[string]string `json:"checks"`
}

// SolanaAccountInfo represents basic account info from RPC
type SolanaAccountInfo struct {
	Pubkey   solana.PublicKey `json:"pubkey"`
	Lamports uint64           `json:"lamports"`
	Owner    solana.PublicKey `json:"owner"`
	Executable bool           `json:"executable"`
	RentEpoch uint64          `json:"rent_epoch"`
	Data     []byte           `json:"data"`
}

// MetaplexCoreAsset represents a Metaplex Core asset (SBT)
type MetaplexCoreAsset struct {
	ID           string                 `json:"id"`
	Owner        string                 `json:"owner"`
	Data         map[string]interface{} `json:"data"`
	Mutable      bool                   `json:"mutable"`
	BurnDelegate *string                `json:"burn_delegate,omitempty"`
	FreezeDelegate *string              `json:"freeze_delegate,omitempty"`
	UpdateAuthority string              `json:"update_authority"`
	CreatedAt    string                 `json:"created_at"`
	UpdatedAt    string                 `json:"updated_at"`
}

// HeliusDASResponse represents the response from Helius DAS API
type HeliusDASResponse struct {
	Items []MetaplexCoreAsset `json:"items"`
	Total int                 `json:"total"`
	Page  int                 `json:"page"`
	Limit int                 `json:"limit"`
}