package models

import (
	"github.com/gagliardetto/solana-go"
)

// MasterRegistryAccount represents the Master Registry on-chain account
type MasterRegistryAccount struct {
	Pubkey    solana.PublicKey
	Authority solana.PublicKey
	Bump      uint8
}

// UniversityRecordAccount represents a University Record on-chain account
type UniversityRecordAccount struct {
	Pubkey             solana.PublicKey
	InstitutionPubkey  solana.PublicKey
	CNPJ               string
	IsActive           bool
	Bump               uint8
}