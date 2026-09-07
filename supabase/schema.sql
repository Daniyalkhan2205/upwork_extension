-- ==============================================================================
-- EMPLOYEE ACTIVITY & BIDDER PERFORMANCE TRACKER
-- Supabase / PostgreSQL Schema Definition
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Tracks bidders, agency managers, and admins
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bidder_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "BIDDER_01", "ALEX_M"
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'bidder' CHECK (role IN ('bidder', 'manager', 'admin')),
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    telegram_chat_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSIONS TABLE
-- Tracks Clock In / Clock Out shifts and aggregated shift metrics
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in_time TIMESTAMPTZ NOT NULL,
    clock_out_time TIMESTAMPTZ,
    total_clocked_seconds INTEGER DEFAULT 0,
    total_active_seconds INTEGER DEFAULT 0,
    total_idle_seconds INTEGER DEFAULT 0,
    total_upwork_seconds INTEGER DEFAULT 0,
    total_other_work_seconds INTEGER DEFAULT 0,
    total_non_work_seconds INTEGER DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DOMAIN LOGS TABLE
-- Tracks domain and sub-path active seconds per session
CREATE TABLE IF NOT EXISTS domain_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    subpath VARCHAR(500) DEFAULT '',
    category VARCHAR(50) NOT NULL CHECK (category IN ('work_upwork', 'work_other', 'non_work', 'idle')),
    active_seconds INTEGER DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DAILY KPIS TABLE (Layer 2 Output & Performance)
-- Tracks output and conversion metrics per bidder per day
CREATE TABLE IF NOT EXISTS daily_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    jobs_reviewed INTEGER DEFAULT 0 CHECK (jobs_reviewed >= 0),
    proposals_submitted INTEGER DEFAULT 0 CHECK (proposals_submitted >= 0),
    connects_used INTEGER DEFAULT 0 CHECK (connects_used >= 0),
    replies INTEGER DEFAULT 0 CHECK (replies >= 0),
    interviews INTEGER DEFAULT 0 CHECK (interviews >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 5. HEARTBEAT TELEMETRY LOGS (High-resolution 1-minute telemetry)
CREATE TABLE IF NOT EXISTS heartbeat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_idle BOOLEAN DEFAULT FALSE,
    active_domain VARCHAR(255),
    active_subpath VARCHAR(500),
    category VARCHAR(50),
    active_seconds_slice INTEGER DEFAULT 60
);

-- 6. WEBHOOK NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'clock_in', 'clock_out', 'alert'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'delivered',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_domain_logs_session ON domain_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_domain_logs_user_date ON domain_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_domain_logs_category ON domain_logs(category);
CREATE INDEX IF NOT EXISTS idx_daily_kpis_user_date ON daily_kpis(user_id, date);
CREATE INDEX IF NOT EXISTS idx_heartbeats_session_time ON heartbeat_logs(session_id, timestamp);

-- ==============================================================================
-- SEED DATA FOR DEMO & TESTING
-- ==============================================================================
INSERT INTO users (id, bidder_code, name, email, role, hourly_rate) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'BIDDER_01', 'Alex Mercer', 'alex.bidder@agency.com', 'bidder', 15.00),
    ('a0000000-0000-0000-0000-000000000002', 'BIDDER_02', 'Sara Connor', 'sara.bidder@agency.com', 'bidder', 16.50),
    ('a0000000-0000-0000-0000-000000000003', 'BIDDER_03', 'Liam Vance', 'liam.bidder@agency.com', 'bidder', 14.00)
ON CONFLICT (bidder_code) DO NOTHING;

-- Seed today's KPI entries for demo
INSERT INTO daily_kpis (user_id, date, jobs_reviewed, proposals_submitted, connects_used, replies, interviews, notes) VALUES
    ('a0000000-0000-0000-0000-000000000001', CURRENT_DATE, 42, 8, 48, 3, 2, 'Strong response on Next.js and AI bids'),
    ('a0000000-0000-0000-0000-000000000002', CURRENT_DATE, 65, 2, 16, 0, 0, 'High job review count, low proposal submission'),
    ('a0000000-0000-0000-0000-000000000003', CURRENT_DATE, 15, 1, 8, 0, 0, 'Long idle periods recorded')
ON CONFLICT (user_id, date) DO NOTHING;
