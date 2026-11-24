use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod solana_vault_lab {
    use super::*;

    /// 初始化用户金库 PDA（记录规范 bump）
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.balance = 0;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    // =========================================================================
    // 1. 缺失 Signer 与 PDA 校验
    // =========================================================================

    // ❌ 漏洞：只比对公钥相等，未校验 authority 是否真实签名，也未校验 PDA seeds/bump
    pub fn withdraw_vulnerable(ctx: Context<WithdrawVulnerable>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.authority == ctx.accounts.authority.key(),
            VaultError::Unauthorized
        );
        // 攻击者无需私钥，只需把管理员公钥作为普通 AccountInfo 传入即可扣减余额
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(VaultError::InsufficientBalance)?;
        Ok(())
    }

    // ✅ 修复：使用 Signer<'info>、规范 PDA seeds/bump 与 has_one = authority
    pub fn withdraw_safe(ctx: Context<WithdrawSafe>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.balance = vault
            .balance
            .checked_sub(amount)
            .ok_or(VaultError::InsufficientBalance)?;
        Ok(())
    }

    // =========================================================================
    // 2. 账户关闭复活（Account Revival）
    // =========================================================================

    // ❌ 漏洞：仅转走 Lamports，未清空账户数据且未覆盖 Discriminator
    // 攻击者可在同一笔交易的下一条指令向 vault 重新转入免租 Lamports，使旧数据“复活”
    pub fn close_vault_vulnerable(ctx: Context<CloseVaultVulnerable>) -> Result<()> {
        let vault_info = ctx.accounts.vault.to_account_info();
        let dest_info = ctx.accounts.authority.to_account_info();
        let lamports = vault_info.lamports();
        **vault_info.try_borrow_mut_lamports()? = 0;
        **dest_info.try_borrow_mut_lamports()? = dest_info
            .lamports()
            .checked_add(lamports)
            .ok_or(VaultError::Overflow)?;
        Ok(())
    }

    // ✅ 修复：由 Anchor `close = authority` 宏在退出时清零数据、写入关闭鉴别器并返还 Lamports
    pub fn close_vault_safe(_ctx: Context<CloseVaultSafe>) -> Result<()> {
        Ok(())
    }

    // =========================================================================
    // 3. 任意 CPI 与 PDA 签名权透传
    // =========================================================================

    // ❌ 漏洞：token_program 为 UncheckedAccount，攻击者可传入恶意程序截获 PDA 签名权
    pub fn cpi_transfer_vulnerable(
        ctx: Context<CpiTransferVulnerable>,
        amount: u64,
    ) -> Result<()> {
        let authority_key = ctx.accounts.authority.key();
        let seeds: &[&[u8]] = &[b"vault", authority_key.as_ref(), &[ctx.accounts.vault.bump]];
        let signer_seeds = &[seeds];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), // ❌ 未校验是否为官方 SPL Token 程序
            cpi_accounts,
            signer_seeds,
        );
        token::transfer(cpi_ctx, amount)
    }

    // ✅ 修复：使用 Program<'info, Token> 强制校验目标程序 ID == spl_token::ID
    pub fn cpi_transfer_safe(ctx: Context<CpiTransferSafe>, amount: u64) -> Result<()> {
        let authority_key = ctx.accounts.authority.key();
        let seeds: &[&[u8]] = &[b"vault", authority_key.as_ref(), &[ctx.accounts.vault.bump]];
        let signer_seeds = &[seeds];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), // ✅ 已由 Anchor 校验官方 Token Program ID
            cpi_accounts,
            signer_seeds,
        );
        token::transfer(cpi_ctx, amount)
    }
}

#[account]
pub struct VaultState {
    pub authority: Pubkey,
    pub balance: u64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"vault", authority.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawVulnerable<'info> {
    #[account(mut)]
    pub vault: Account<'info, VaultState>,
    /// CHECK: 故意留作漏洞教学：未强制 Signer
    pub authority: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct WithdrawSafe<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority
    )]
    pub vault: Account<'info, VaultState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseVaultVulnerable<'info> {
    #[account(mut, has_one = authority)]
    pub vault: Account<'info, VaultState>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseVaultSafe<'info> {
    #[account(
        mut,
        seeds = [b"vault", authority.key().as_ref()],
        bump = vault.bump,
        has_one = authority,
        close = authority
    )]
    pub vault: Account<'info, VaultState>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CpiTransferVulnerable<'info> {
    #[account(seeds = [b"vault", authority.key().as_ref()], bump = vault.bump, has_one = authority)]
    pub vault: Account<'info, VaultState>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub vault_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    /// CHECK: 故意留作漏洞教学：未校验 SPL Token Program ID
    pub token_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CpiTransferSafe<'info> {
    #[account(seeds = [b"vault", authority.key().as_ref()], bump = vault.bump, has_one = authority)]
    pub vault: Account<'info, VaultState>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub vault_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum VaultError {
    #[msg("Unauthorized authority")]
    Unauthorized,
    #[msg("Insufficient vault balance")]
    InsufficientBalance,
    #[msg("Arithmetic overflow")]
    Overflow,
}
