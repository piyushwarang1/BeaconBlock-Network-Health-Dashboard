-- TimescaleDB hypertables for time-series data
-- Run this script to set up the database schema

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Price data hypertable
CREATE TABLE price_data (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    token VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(24,8) NOT NULL,
    market_cap DECIMAL(24,2),
    volume_24h DECIMAL(24,2),
    price_change_24h DECIMAL(8,4),
    source VARCHAR(50) NOT NULL DEFAULT 'coingecko'
);

-- Volume data hypertable
CREATE TABLE volume_data (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pair VARCHAR(100) NOT NULL,
    token0 VARCHAR(50) NOT NULL,
    token1 VARCHAR(50) NOT NULL,
    volume_24h DECIMAL(24,2) NOT NULL,
    liquidity DECIMAL(24,2),
    price DECIMAL(24,8),
    dex VARCHAR(50) NOT NULL DEFAULT 'uniswap'
);

-- EVM transactions hypertable
CREATE TABLE evm_transactions (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    chain_id VARCHAR(50) NOT NULL,
    hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(66) NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    value DECIMAL(36,0) NOT NULL DEFAULT 0,
    gas_price DECIMAL(24,0),
    gas_limit DECIMAL(24,0),
    gas_used DECIMAL(24,0),
    status BOOLEAN DEFAULT TRUE,
    contract_address VARCHAR(42),
    logs JSONB DEFAULT '[]'::jsonb
);

-- Convert to hypertables for time-series optimization
SELECT create_hypertable('price_data', 'time', chunk_time_interval => INTERVAL '1 day');
SELECT create_hypertable('volume_data', 'time', chunk_time_interval => INTERVAL '1 day');
SELECT create_hypertable('evm_transactions', 'time', chunk_time_interval => INTERVAL '1 hour');

-- Add indexes for performance
CREATE INDEX idx_price_token_time ON price_data (token, time DESC);
CREATE INDEX idx_volume_pair_time ON volume_data (pair, time DESC);
CREATE INDEX idx_evm_chain_time ON evm_transactions (chain_id, time DESC);
CREATE INDEX idx_evm_hash ON evm_transactions (hash);
CREATE INDEX idx_evm_block_number ON evm_transactions (chain_id, block_number DESC);

-- Add compression policies (optional - for data older than 30 days)
-- SELECT add_compression_policy('price_data', INTERVAL '30 days');
-- SELECT add_compression_policy('volume_data', INTERVAL '30 days');
-- SELECT add_compression_policy('evm_transactions', INTERVAL '7 days');

-- Add retention policies (optional - keep data for 1 year)
-- SELECT add_retention_policy('price_data', INTERVAL '1 year');
-- SELECT add_retention_policy('volume_data', INTERVAL '1 year');
-- SELECT add_retention_policy('evm_transactions', INTERVAL '90 days');