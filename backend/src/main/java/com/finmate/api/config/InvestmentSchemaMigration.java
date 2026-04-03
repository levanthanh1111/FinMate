package com.finmate.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InvestmentSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void recreateInvestmentSchema() {
        jdbcTemplate.execute("""
                DO $$
                BEGIN
                    CREATE TABLE IF NOT EXISTS app_schema_migrations (
                        migration_key VARCHAR(100) PRIMARY KEY,
                        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
                    );

                    IF EXISTS (
                        SELECT 1 FROM app_schema_migrations WHERE migration_key = 'investment_management_v2'
                    ) THEN
                        RETURN;
                    END IF;

                    DROP TABLE IF EXISTS investment_transactions CASCADE;
                    DROP TABLE IF EXISTS asset_latest_prices CASCADE;
                    DROP TABLE IF EXISTS investment_assets CASCADE;
                    DROP TABLE IF EXISTS investment_portfolios CASCADE;

                    CREATE TABLE investment_portfolios (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        name VARCHAR(120) NOT NULL,
                        institution VARCHAR(160),
                        base_currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                        description TEXT,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        CONSTRAINT uq_investment_portfolios_user_name UNIQUE (user_id, name)
                    );

                    CREATE TABLE investment_assets (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        symbol VARCHAR(32) NOT NULL,
                        name VARCHAR(160) NOT NULL,
                        asset_type VARCHAR(20) NOT NULL,
                        market VARCHAR(64),
                        currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                        active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        CONSTRAINT chk_investment_assets_asset_type CHECK (asset_type IN ('STOCK', 'ETF', 'FUND', 'CRYPTO', 'BOND', 'OTHER')),
                        CONSTRAINT uq_investment_assets_user_symbol UNIQUE (user_id, symbol)
                    );

                    CREATE TABLE asset_latest_prices (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        asset_id BIGINT NOT NULL,
                        price NUMERIC(19, 6) NOT NULL,
                        currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                        price_date TIMESTAMP NOT NULL,
                        source VARCHAR(50),
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        CONSTRAINT chk_asset_latest_prices_price_positive CHECK (price > 0),
                        CONSTRAINT fk_asset_latest_prices_asset FOREIGN KEY (asset_id) REFERENCES investment_assets(id) ON DELETE CASCADE
                    );

                    CREATE TABLE investment_transactions (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        portfolio_id BIGINT NOT NULL,
                        asset_id BIGINT NOT NULL,
                        type VARCHAR(10) NOT NULL,
                        quantity NUMERIC(19, 6) NOT NULL,
                        unit_price NUMERIC(19, 6) NOT NULL,
                        fee NUMERIC(19, 6) NOT NULL DEFAULT 0,
                        tax NUMERIC(19, 6) NOT NULL DEFAULT 0,
                        currency VARCHAR(3) NOT NULL DEFAULT 'VND',
                        transaction_date TIMESTAMP NOT NULL,
                        note TEXT,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        CONSTRAINT chk_investment_transactions_type CHECK (type IN ('BUY', 'SELL')),
                        CONSTRAINT chk_investment_transactions_quantity_positive CHECK (quantity > 0),
                        CONSTRAINT chk_investment_transactions_unit_price_positive CHECK (unit_price > 0),
                        CONSTRAINT chk_investment_transactions_fee_nonnegative CHECK (fee >= 0),
                        CONSTRAINT chk_investment_transactions_tax_nonnegative CHECK (tax >= 0),
                        CONSTRAINT fk_investment_transactions_portfolio FOREIGN KEY (portfolio_id) REFERENCES investment_portfolios(id) ON DELETE CASCADE,
                        CONSTRAINT fk_investment_transactions_asset FOREIGN KEY (asset_id) REFERENCES investment_assets(id) ON DELETE CASCADE
                    );

                    CREATE INDEX idx_investment_portfolios_user_id ON investment_portfolios(user_id);
                    CREATE INDEX idx_investment_assets_user_id ON investment_assets(user_id);
                    CREATE INDEX idx_investment_assets_type ON investment_assets(asset_type);
                    CREATE INDEX idx_asset_latest_prices_asset_date ON asset_latest_prices(asset_id, price_date DESC);
                    CREATE INDEX idx_investment_transactions_portfolio_date ON investment_transactions(portfolio_id, transaction_date DESC);
                    CREATE INDEX idx_investment_transactions_asset_date ON investment_transactions(asset_id, transaction_date DESC);
                    CREATE INDEX idx_investment_transactions_type ON investment_transactions(type);

                    INSERT INTO app_schema_migrations (migration_key) VALUES ('investment_management_v2');
                END $$;
                """);
    }
}
