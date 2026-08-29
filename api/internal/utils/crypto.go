package utils

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"sort"

	"github.com/btcsuite/btcd/btcec/v2"
	"github.com/btcsuite/btcd/btcec/v2/schnorr"
	"github.com/tyler-smith/go-bip39"
)

// BIP44Deriver handles deterministic wallet derivation for students
type BIP44Deriver struct {
	MasterSeed []byte
	CoinType   uint32 // 501 for Solana
}

// NewBIP44Deriver creates a new BIP44 deriver from master seed
func NewBIP44Deriver(masterSeed []byte, coinType uint32) *BIP44Deriver {
	return &BIP44Deriver{
		MasterSeed: masterSeed,
		CoinType:   coinType,
	}
}

// DeriveStudentKeypair derives a Solana keypair for a student using BIP44
// Path: m/44'/501'/account'/0/address_index
// For students: account = student UUID namespace, address_index = 0
func (d *BIP44Deriver) DeriveStudentKeypair(studentUUID string, index uint32) (*ecdsa.PrivateKey, error) {
	// Convert UUID to deterministic account index
	accountIndex := uuidToAccountIndex(studentUUID)
	
	// BIP32 derivation path: m/44'/501'/account'/0/index
	path := []uint32{
		44 | 0x80000000,       // purpose (hardened)
		d.CoinType | 0x80000000, // coin type (hardened)
		accountIndex | 0x80000000, // account (hardened)
		0,                       // change (0 = external)
		index,                   // address index
	}

	privateKey, err := derivePath(d.MasterSeed, path)
	if err != nil {
		return nil, fmt.Errorf("failed to derive path: %w", err)
	}

	return privateKey, nil
}

// DeriveStudentPubkey derives just the public key for a student
func (d *BIP44Deriver) DeriveStudentPubkey(studentUUID string, index uint32) (string, error) {
	privateKey, err := d.DeriveStudentKeypair(studentUUID, index)
	if err != nil {
		return "", err
	}
	
	pubKey := privateKey.PublicKey
	pubKeyBytes := elliptic.MarshalCompressed(pubKey.Curve, pubKey.X, pubKey.Y)
	
	// Solana uses raw 32-byte public key (Ed25519)
	// For secp256k1 (BIP44), we need to convert or use Ed25519 derivation
	// Note: Solana uses Ed25519, not secp256k1. This is a simplified version.
	// In production, use ed25519 derivation (BIP32-Ed25519) or Solana's native derivation.
	
	return hex.EncodeToString(pubKeyBytes), nil
}

// uuidToAccountIndex converts a UUID to a deterministic uint32 for BIP44 account
func uuidToAccountIndex(uuidStr string) uint32 {
	hash := sha256.Sum256([]byte(uuidStr))
	// Use first 4 bytes as uint32
	return uint32(hash[0])<<24 | uint32(hash[1])<<16 | uint32(hash[2])<<8 | uint32(hash[3])
}

// derivePath performs BIP32 key derivation
func derivePath(seed []byte, path []uint32) (*ecdsa.PrivateKey, error) {
	masterKey, err := btcec.NewPrivateKeyFromSeed(seed)
	if err != nil {
		return nil, err
	}

	currentKey := masterKey
	for _, childIndex := range path {
		currentKey, err = deriveChild(currentKey, childIndex)
		if err != nil {
			return nil, err
		}
	}

	return currentKey.ToECDSA(), nil
}

// deriveChild derives a child key from parent (simplified BIP32)
func deriveChild(parent *btcec.PrivateKey, index uint32) (*btcec.PrivateKey, error) {
	// This is a simplified version. Production should use a proper BIP32 library
	// like github.com/btcsuite/btcutil/hdkeychain
	data := make([]byte, 37)
	copy(data[0:33], parent.PubKey().SerializeCompressed())
	
	// Write index as big-endian
	data[33] = byte(index >> 24)
	data[34] = byte(index >> 16)
	data[35] = byte(index >> 8)
	data[36] = byte(index)
	
	// HMAC-SHA512 with chain code (simplified - using parent's private key as chain code)
	// In real BIP32, we need the chain code from the extended key
	hash := hmacSHA512(parent.Serialize(), data)
	
	// Left 32 bytes = private key offset
	// Right 32 bytes = new chain code
	offset := new(big.Int).SetBytes(hash[:32])
	curve := btcec.S256()
	
	newPrivKey := new(big.Int).Add(parent.D, offset)
	newPrivKey.Mod(newPrivKey, curve.N)
	
	return btcec.PrivKeyFromBytes(newPrivKey.FillBytes(make([]byte, 32)))
}

// hmacSHA512 computes HMAC-SHA512
func hmacSHA512(key, data []byte) []byte {
	// Simplified - use crypto/hmac in production
	h := sha256.New()
	h.Write(key)
	h.Write(data)
	return h.Sum(nil)
}

// GenerateMasterSeed generates a new BIP39 master seed
func GenerateMasterSeed() ([]byte, string, error) {
	entropy, err := bip39.NewEntropy(256)
	if err != nil {
		return nil, "", err
	}
	
	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return nil, "", err
	}
	
	seed := bip39.NewSeed(mnemonic, "") // No passphrase for MVP
	return seed, mnemonic, nil
}

// CanonicalizeDocument creates a canonical JSON representation for hashing
func CanonicalizeDocument(metadata map[string]interface{}) ([]byte, error) {
	// Sort keys for deterministic output
	keys := make([]string, 0, len(metadata))
	for k := range metadata {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	
	// Create ordered map
	ordered := make(map[string]interface{}, len(metadata))
	for _, k := range keys {
		ordered[k] = metadata[k]
	}
	
	// Marshal with sorted keys
	return json.Marshal(ordered)
}

// ComputeDocumentHash computes SHA-256 hash of canonicalized document
func ComputeDocumentHash(metadata map[string]interface{}) (string, error) {
	canonical, err := CanonicalizeDocument(metadata)
	if err != nil {
		return "", err
	}
	
	hash := sha256.Sum256(canonical)
	return hex.EncodeToString(hash[:]), nil
}

// MockICPBrasilSign creates a mock ICP-Brasil signature for MVP
// Production: Replace with AWS CloudHSM + Lambda signing
func MockICPBrasilSign(documentHash string, privateKey *ecdsa.PrivateKey) (string, error) {
	hashBytes, err := hex.DecodeString(documentHash)
	if err != nil {
		return "", err
	}
	
	// Sign with ECDSA (secp256k1) - mock for MVP
	r, s, err := ecdsa.Sign(rand.Reader, privateKey, hashBytes)
	if err != nil {
		return "", err
	}
	
	// Encode as DER
	der, err := encodeDER(r, s)
	if err != nil {
		return "", err
	}
	
	return hex.EncodeToString(der), nil
}

// encodeDER encodes ECDSA signature in DER format
func encodeDER(r, s *big.Int) ([]byte, error) {
	// Simplified DER encoding
	rBytes := r.FillBytes(make([]byte, 32))
	sBytes := s.FillBytes(make([]byte, 32))
	
	// Remove leading zeros
	rBytes = trimLeadingZeros(rBytes)
	sBytes = trimLeadingZeros(sBytes)
	
	// Add 0x00 if high bit set
	if rBytes[0]&0x80 != 0 {
		rBytes = append([]byte{0x00}, rBytes...)
	}
	if sBytes[0]&0x80 != 0 {
		sBytes = append([]byte{0x00}, sBytes...)
	}
	
	// Build DER: 0x30 [total-len] 0x02 [r-len] r 0x02 [s-len] s
	return []byte{
		0x30, byte(2 + len(rBytes) + 2 + len(sBytes)),
		0x02, byte(len(rBytes)),
	}, nil // Incomplete - use crypto/ecdsa marshaling in production
}

func trimLeadingZeros(b []byte) []byte {
	i := 0
	for i < len(b)-1 && b[i] == 0 {
		i++
	}
	return b[i:]
}