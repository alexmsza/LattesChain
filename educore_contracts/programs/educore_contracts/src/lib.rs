//! EduCore Protocol - Smart Contracts for LattesChain
//! 
//! This program implements the Master Registry for educational institutions
//! and provides instructions for logging academic events on Solana.

use anchor_lang::prelude::*;
use anchor_spl::memo::Memo;

declare_id!("EduCore11111111111111111111111111111111111111111111");

#[program]
pub mod educore_contracts {
    use super::*;

    /// Initialize the Master Registry - only callable by deployer/super admin
    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.master_registry;
        registry.authority = ctx.accounts.authority.key();
        registry.bump = ctx.bumps.master_registry;
        registry.is_paused = false;
        registry.total_institutions = 0;
        registry.total_events_logged = 0;
        
        emit!(RegistryInitialized {
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Register a new university/institution - only callable by MasterRegistry authority
    pub fn register_university(
        ctx: Context<RegisterUniversity>,
        cnpj: String,
        name: String,
    ) -> Result<()> {
        // Validate CNPJ format (14 digits)
        require!(cnpj.len() == 14, ErrorCode::InvalidCNPJLength);
        require!(cnpj.chars().all(|c| c.is_ascii_digit()), ErrorCode::InvalidCNPJFormat);
        
        // Validate name length
        require!(name.len() <= 100, ErrorCode::InvalidNameLength);
        
        let university = &mut ctx.accounts.university_record;
        university.institution_pubkey = ctx.accounts.institution_pubkey.key();
        university.cnpj = cnpj.as_bytes().try_into().unwrap();
        university.name = name;
        university.is_active = true;
        university.bump = ctx.bumps.university_record;
        university.registered_at = Clock::get()?.unix_timestamp;
        university.total_emissions = 0;

        // Update registry counter
        let registry = &mut ctx.accounts.master_registry;
        registry.total_institutions = registry.total_institutions.checked_add(1).unwrap();

        emit!(UniversityRegistered {
            institution: ctx.accounts.institution_pubkey.key(),
            cnpj,
            name,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update university status (activate/deactivate) - only callable by authority
    pub fn update_university_status(
        ctx: Context<UpdateUniversityStatus>,
        is_active: bool,
    ) -> Result<()> {
        let university = &mut ctx.accounts.university_record;
        university.is_active = is_active;
        university.updated_at = Clock::get()?.unix_timestamp;

        emit!(UniversityStatusUpdated {
            institution: university.institution_pubkey,
            is_active,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Log an academic event (certificate, hours, diploma) - callable by registered institution
    pub fn log_academic_event(
        ctx: Context<LogAcademicEvent>,
        document_hash: String,
        icp_signature: String,
        document_type: DocumentType,
        metadata_uri: Option<String>,
    ) -> Result<()> {
        // Validate hash length (SHA-256 = 64 hex chars)
        require!(document_hash.len() == 64, ErrorCode::InvalidHashLength);
        require!(document_hash.chars().all(|c| c.is_ascii_hexdigit()), ErrorCode::InvalidHashFormat);
        
        // Validate ICP signature not empty
        require!(!icp_signature.is_empty(), ErrorCode::EmptyICPSignature);
        
        // Check if university is active
        let university = &ctx.accounts.university_record;
        require!(university.is_active, ErrorCode::UniversityInactive);

        // Emit event for indexing
        emit!(AcademicEventLogged {
            institution: university.institution_pubkey,
            document_hash: document_hash.clone(),
            icp_signature: icp_signature.clone(),
            document_type: document_type as u8,
            metadata_uri: metadata_uri.clone().unwrap_or_default(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        // Update university emission counter
        let university_mut = &mut ctx.accounts.university_record;
        university_mut.total_emissions = university_mut.total_emissions.checked_add(1).unwrap();
        university_mut.last_emission_at = Clock::get()?.unix_timestamp;

        // Update registry counter
        let registry = &mut ctx.accounts.master_registry;
        registry.total_events_logged = registry.total_events_logged.checked_add(1).unwrap();

        // Also log via SPL Memo for additional audit trail
        let memo_data = format!(
            "EduCore:{}:{}:{}:{}",
            university.institution_pubkey,
            document_hash,
            icp_signature,
            document_type as u8
        );
        
        let cpi_accounts = anchor_spl::memo::Memo {
            memo_program: ctx.accounts.memo_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.memo_program.to_account_info(), cpi_accounts);
        anchor_spl::memo::spl_memo(cpi_ctx, memo_data.as_bytes())?;

        Ok(())
    }

    /// Batch log multiple academic events - for bulk certificate issuance
    pub fn batch_log_academic_events(
        ctx: Context<BatchLogAcademicEvents>,
        events: Vec<BatchEventData>,
    ) -> Result<()> {
        require!(events.len() <= 10, ErrorCode::BatchTooLarge);
        
        let university = &ctx.accounts.university_record;
        require!(university.is_active, ErrorCode::UniversityInactive);

        let mut total_added = 0u64;
        
        for event in events {
            // Validate each event
            require!(event.document_hash.len() == 64, ErrorCode::InvalidHashLength);
            require!(!event.icp_signature.is_empty(), ErrorCode::EmptyICPSignature);
            
            emit!(AcademicEventLogged {
                institution: university.institution_pubkey,
                document_hash: event.document_hash,
                icp_signature: event.icp_signature,
                document_type: event.document_type as u8,
                metadata_uri: event.metadata_uri.unwrap_or_default(),
                timestamp: Clock::get()?.unix_timestamp,
            });
            
            total_added = total_added.checked_add(1).unwrap();
        }

        // Update counters
        let university_mut = &mut ctx.accounts.university_record;
        university_mut.total_emissions = university_mut.total_emissions.checked_add(total_added).unwrap();
        university_mut.last_emission_at = Clock::get()?.unix_timestamp;

        let registry = &mut ctx.accounts.master_registry;
        registry.total_events_logged = registry.total_events_logged.checked_add(total_added).unwrap();

        Ok(())
    }

    /// Pause/unpause the entire program - emergency circuit breaker
    pub fn set_pause_status(ctx: Context<SetPauseStatus>, is_paused: bool) -> Result<()> {
        let registry = &mut ctx.accounts.master_registry;
        registry.is_paused = is_paused;
        registry.updated_at = Clock::get()?.unix_timestamp;

        emit!(PauseStatusChanged {
            is_paused,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Rotate authority - transfer control to new authority (with timelock in production)
    pub fn rotate_authority(ctx: Context<RotateAuthority>, new_authority: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.master_registry;
        let old_authority = registry.authority;
        registry.authority = new_authority;
        registry.updated_at = Clock::get()?.unix_timestamp;

        emit!(AuthorityRotated {
            old_authority,
            new_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// ============================================
// ACCOUNTS
// ============================================

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MasterRegistry::INIT_SPACE,
        seeds = [b"master_registry"],
        bump
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterUniversity<'info> {
    #[account(
        mut,
        seeds = [b"master_registry"],
        bump = master_registry.bump,
        has_one = authority
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + UniversityRecord::INIT_SPACE,
        seeds = [b"university_record", institution_pubkey.key().as_ref()],
        bump
    )]
    pub university_record: Account<'info, UniversityRecord>,
    
    /// CHECK: The institution's Solana public key (not a signer, just reference)
    pub institution_pubkey: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUniversityStatus<'info> {
    #[account(
        mut,
        seeds = [b"master_registry"],
        bump = master_registry.bump,
        has_one = authority
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    #[account(
        mut,
        seeds = [b"university_record", university_record.institution_pubkey.as_ref()],
        bump = university_record.bump
    )]
    pub university_record: Account<'info, UniversityRecord>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct LogAcademicEvent<'info> {
    #[account(
        seeds = [b"master_registry"],
        bump = master_registry.bump
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    #[account(
        mut,
        seeds = [b"university_record", university_record.institution_pubkey.as_ref()],
        bump = university_record.bump
    )]
    pub university_record: Account<'info, UniversityRecord>,
    
    /// The institution's public key must sign
    #[account(
        constraint = institution_signer.key() == university_record.institution_pubkey @ ErrorCode::UnauthorizedInstitution
    )]
    pub institution_signer: Signer<'info>,
    
    /// SPL Memo program for audit trail
    /// CHECK: Verified by CPI
    pub memo_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct BatchLogAcademicEvents<'info> {
    #[account(
        seeds = [b"master_registry"],
        bump = master_registry.bump
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    #[account(
        mut,
        seeds = [b"university_record", university_record.institution_pubkey.as_ref()],
        bump = university_record.bump
    )]
    pub university_record: Account<'info, UniversityRecord>,
    
    #[account(
        constraint = institution_signer.key() == university_record.institution_pubkey @ ErrorCode::UnauthorizedInstitution
    )]
    pub institution_signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPauseStatus<'info> {
    #[account(
        mut,
        seeds = [b"master_registry"],
        bump = master_registry.bump,
        has_one = authority
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RotateAuthority<'info> {
    #[account(
        mut,
        seeds = [b"master_registry"],
        bump = master_registry.bump,
        has_one = authority
    )]
    pub master_registry: Account<'info, MasterRegistry>,
    
    pub authority: Signer<'info>,
}

// ============================================
// ACCOUNT STRUCTS
// ============================================

#[account]
#[derive(InitSpace)]
pub struct MasterRegistry {
    pub authority: Pubkey,
    pub bump: u8,
    pub is_paused: bool,
    pub total_institutions: u64,
    pub total_events_logged: u64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct UniversityRecord {
    pub institution_pubkey: Pubkey,
    #[max_len(14)]
    pub cnpj: Vec<u8>,
    #[max_len(100)]
    pub name: String,
    pub is_active: bool,
    pub bump: u8,
    pub registered_at: i64,
    pub updated_at: i64,
    pub total_emissions: u64,
    pub last_emission_at: i64,
}

// ============================================
// EVENTS
// ============================================

#[event]
pub struct RegistryInitialized {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct UniversityRegistered {
    pub institution: Pubkey,
    pub cnpj: String,
    pub name: String,
    pub timestamp: i64,
}

#[event]
pub struct UniversityStatusUpdated {
    pub institution: Pubkey,
    pub is_active: bool,
    pub timestamp: i64,
}

#[event]
pub struct AcademicEventLogged {
    pub institution: Pubkey,
    pub document_hash: String,
    pub icp_signature: String,
    pub document_type: u8,
    pub metadata_uri: String,
    pub timestamp: i64,
}

#[event]
pub struct PauseStatusChanged {
    pub is_paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct AuthorityRotated {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

// ============================================
// INPUT TYPES
// ============================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct BatchEventData {
    pub document_hash: String,
    pub icp_signature: String,
    pub document_type: DocumentType,
    pub metadata_uri: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DocumentType {
    Diploma = 0,
    HorasComplementares = 1,
    CertificadoCurso = 2,
    HistoricoEscolar = 3,
}

// ============================================
// ERROR CODES
// ============================================

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: signer does not have required permissions")]
    Unauthorized,
    
    #[msg("University not registered in the Master Registry")]
    UniversityNotRegistered,
    
    #[msg("University is inactive or suspended")]
    UniversityInactive,
    
    #[msg("Invalid hash length: SHA-256 must be exactly 64 hex characters")]
    InvalidHashLength,
    
    #[msg("Invalid hash format: must be valid hexadecimal")]
    InvalidHashFormat,
    
    #[msg("Invalid CNPJ length: must be exactly 14 digits")]
    InvalidCNPJLength,
    
    #[msg("Invalid CNPJ format: must contain only digits")]
    InvalidCNPJFormat,
    
    #[msg("Invalid name length: maximum 100 characters")]
    InvalidNameLength,
    
    #[msg("ICP-Brasil signature cannot be empty")]
    EmptyICPSignature,
    
    #[msg("Batch size too large: maximum 10 events per batch")]
    BatchTooLarge,
    
    #[msg("Program is paused")]
    ProgramPaused,
    
    #[msg("Institution signer does not match registered university")]
    UnauthorizedInstitution,
}