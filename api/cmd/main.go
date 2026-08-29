package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/educore-latteschain/api/internal/config"
	"github.com/educore-latteschain/api/internal/handlers"
	"github.com/educore-latteschain/api/internal/services"
)

func main() {
	// Initialize zerolog
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	if err := cfg.Validate(); err != nil {
		log.Fatal().Err(err).Msg("Configuration validation failed")
	}

	log.Info().Str("environment", cfg.Server.Environment).Msg("Starting EduCore Relayer")

	// Initialize services
	solanaService, err := services.NewSolanaService(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize Solana service")
	}

	supabaseService, err := services.NewSupabaseService(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize Supabase service")
	}

	// Initialize handlers
	handler := handlers.NewHandler(solanaService, supabaseService)

	// Setup Gin router
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(zerologMiddleware())

	// Health check
	router.GET("/health", handler.HealthCheck)

	// API routes
	api := router.Group("/api")
	{
		api.POST("/issue_certificate", handler.IssueCertificate)
		api.POST("/verify/pdf", handler.VerifyPDF)
		api.GET("/students/:id/records", handler.GetStudentRecords)
		api.GET("/institutions/:id/records", handler.GetInstitutionRecords)
		api.GET("/students/:id/assets", handler.GetStudentAssets)
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Info().Str("port", cfg.Server.Port).Msg("Server starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failed to start")
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited gracefully")
}

// zerologMiddleware adds structured logging to Gin
func zerologMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		log.Info().
			Str("method", method).
			Str("path", path).
			Str("query", query).
			Str("ip", clientIP).
			Int("status", status).
			Dur("latency", latency).
			Msg("HTTP request")
	}
}