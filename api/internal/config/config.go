package config

import (
	"os"
	"strconv"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Solana   SolanaConfig
	Supabase SupabaseConfig
	App      AppConfig
}

type ServerConfig struct {
	Port         string
	Environment  string
	ReadTimeout  int
	WriteTimeout int
}

type SolanaConfig struct {
	HeliusRPCURL      string
	QuickNodeRPCURL   string
	ProgramID         string
	RelayerPrivateKey string // Base58 encoded - for MVP only, production uses CloudHSM
	Commitment        string
}

type SupabaseConfig struct {
	URL                string
	ServiceRoleKey     string
	AnonKey            string
	VaultMasterSeedKey string // Key name in Supabase Vault for master seed
}

type AppConfig struct {
	MasterRegistryPDA string
	BIP44CoinType     uint32 // 501 for Solana
	MockICPSigning    bool   // true for MVP, false for production
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/educore/")

	// Environment variable overrides
	viper.AutomaticEnv()
	viper.SetEnvPrefix("EDUCORE")

	// Defaults
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.environment", "development")
	viper.SetDefault("server.read_timeout", 30)
	viper.SetDefault("server.write_timeout", 30)
	viper.SetDefault("solana.commitment", "confirmed")
	viper.SetDefault("app.bip44_coin_type", 501)
	viper.SetDefault("app.mock_icp_signing", true)

	// Read config file if exists
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
		// Config file not found, continue with env vars and defaults
	}

	cfg := &Config{
		Server: ServerConfig{
			Port:         getEnv("PORT", viper.GetString("server.port")),
			Environment:  viper.GetString("server.environment"),
			ReadTimeout:  viper.GetInt("server.read_timeout"),
			WriteTimeout: viper.GetInt("server.write_timeout"),
		},
		Solana: SolanaConfig{
			HeliusRPCURL:      getEnv("HELIUS_RPC_URL", viper.GetString("solana.helius_rpc_url")),
			QuickNodeRPCURL:   getEnv("QUICKNODE_RPC_URL", viper.GetString("solana.quicknode_rpc_url")),
			ProgramID:         getEnv("MASTER_REGISTRY_PROGRAM_ID", viper.GetString("solana.program_id")),
			RelayerPrivateKey: getEnv("RELAYER_PRIVATE_KEY", viper.GetString("solana.relayer_private_key")),
			Commitment:        viper.GetString("solana.commitment"),
		},
		Supabase: SupabaseConfig{
			URL:                getEnv("SUPABASE_URL", viper.GetString("supabase.url")),
			ServiceRoleKey:     getEnv("SUPABASE_SERVICE_ROLE_KEY", viper.GetString("supabase.service_role_key")),
			AnonKey:            getEnv("SUPABASE_ANON_KEY", viper.GetString("supabase.anon_key")),
			VaultMasterSeedKey: viper.GetString("supabase.vault_master_seed_key"),
		},
		App: AppConfig{
			MasterRegistryPDA: viper.GetString("app.master_registry_pda"),
			BIP44CoinType:     uint32(viper.GetInt("app.bip44_coin_type")),
			MockICPSigning:    viper.GetBool("app.mock_icp_signing"),
		},
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func (c *Config) Validate() error {
	if c.Solana.HeliusRPCURL == "" && c.Solana.QuickNodeRPCURL == "" {
		return ErrMissingRPCURL
	}
	if c.Supabase.URL == "" || c.Supabase.ServiceRoleKey == "" {
		return ErrMissingSupabaseConfig
	}
	if c.Solana.ProgramID == "" {
		return ErrMissingProgramID
	}
	return nil
}

var (
	ErrMissingRPCURL         = &ConfigError{"missing Solana RPC URL (HELIUS_RPC_URL or QUICKNODE_RPC_URL)"}
	ErrMissingSupabaseConfig = &ConfigError{"missing Supabase URL or Service Role Key"}
	ErrMissingProgramID      = &ConfigError{"missing Master Registry Program ID"}
)

type ConfigError struct {
	msg string
}

func (e *ConfigError) Error() string {
	return "config error: " + e.msg
}