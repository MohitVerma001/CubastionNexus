-- =============================================================================
-- Cubastion Nexus — PostgreSQL Schema
-- Database: nexusDev
-- =============================================================================
-- Run:  psql -h localhost -U postgres -d nexusDev -f schema.sql
-- Safe to re-run: tables/indexes use IF NOT EXISTS; seed rows use ON CONFLICT.
-- =============================================================================

-- pgcrypto gives us gen_random_uuid() on PostgreSQL < 13
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- TABLE 1: organisations
-- =============================================================================
CREATE TABLE IF NOT EXISTS organisations (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255)  NOT NULL,
  inbound_email   VARCHAR(255)  UNIQUE,
  primary_contact VARCHAR(255),
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 2: users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id       UUID          REFERENCES organisations(id) ON DELETE SET NULL,
  email                 VARCHAR(255)  NOT NULL UNIQUE,
  name                  VARCHAR(255)  NOT NULL,
  role                  VARCHAR(20)   NOT NULL CHECK (role IN ('customer', 'agent', 'admin')),
  password_hash         VARCHAR(255)  NOT NULL,
  -- NULL means the user has never set their own password and must change it on first login
  password_changed_at   TIMESTAMPTZ,
  is_active             BOOLEAN       NOT NULL DEFAULT true,
  last_login_at         TIMESTAMPTZ,
  failed_login_attempts INTEGER       NOT NULL DEFAULT 0,
  locked_until          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 3: sla_configs
-- =============================================================================
CREATE TABLE IF NOT EXISTS sla_configs (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  priority             VARCHAR(5)   NOT NULL UNIQUE CHECK (priority IN ('P1', 'P2', 'P3')),
  first_response_hours DECIMAL(5,2) NOT NULL,
  resolution_hours     DECIMAL(5,2) NOT NULL,
  updated_by_id        UUID         REFERENCES users(id),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 4: tickets
-- =============================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number            VARCHAR(20)   NOT NULL UNIQUE,
  organisation_id          UUID          NOT NULL REFERENCES organisations(id),
  submitted_by_id          UUID          NOT NULL REFERENCES users(id),
  assigned_to_id           UUID          REFERENCES users(id),
  subject                  VARCHAR(120)  NOT NULL,
  description              TEXT          NOT NULL,
  category                 VARCHAR(50)   NOT NULL
                             CHECK (category IN (
                               'system_issue', 'functional_issue', 'data_issue',
                               'user_management', 'enhancement', 'other'
                             )),
  priority                 VARCHAR(5)    NOT NULL DEFAULT 'P3'
                             CHECK (priority IN ('P1', 'P2', 'P3')),
  status                   VARCHAR(30)   NOT NULL DEFAULT 'open'
                             CHECK (status IN (
                               'open', 'in_progress', 'pending_customer',
                               'closed', 'escalated'
                             )),
  source                   VARCHAR(10)   NOT NULL DEFAULT 'portal'
                             CHECK (source IN ('portal', 'email')),
  sla_first_response_due   TIMESTAMPTZ,
  sla_resolution_due       TIMESTAMPTZ,
  sla_response_breached    BOOLEAN       NOT NULL DEFAULT false,
  sla_resolution_breached  BOOLEAN       NOT NULL DEFAULT false,
  first_response_at        TIMESTAMPTZ,
  sla_paused_at            TIMESTAMPTZ,
  sla_paused_hours         DECIMAL(8,2)  NOT NULL DEFAULT 0,
  closed_at                TIMESTAMPTZ,
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 5: ticket_comments
-- =============================================================================
CREATE TABLE IF NOT EXISTS ticket_comments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  organisation_id UUID         NOT NULL REFERENCES organisations(id),
  author_id       UUID         NOT NULL REFERENCES users(id),
  body            TEXT         NOT NULL,
  is_internal     BOOLEAN      NOT NULL DEFAULT false,
  source          VARCHAR(10)  NOT NULL DEFAULT 'portal',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 6: attachments
-- =============================================================================
CREATE TABLE IF NOT EXISTS attachments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID         NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  organisation_id UUID         NOT NULL REFERENCES organisations(id),
  uploaded_by_id  UUID         NOT NULL REFERENCES users(id),
  filename        VARCHAR(255) NOT NULL,
  original_name   VARCHAR(255),
  storage_path    VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER      NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 7: audit_logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID          REFERENCES tickets(id) ON DELETE SET NULL,
  organisation_id UUID          REFERENCES organisations(id),
  actor_id        UUID          REFERENCES users(id) ON DELETE SET NULL,
  action          VARCHAR(100)  NOT NULL,
  old_value       JSONB,
  new_value       JSONB,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 8: email_templates
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_key      VARCHAR(100) NOT NULL UNIQUE,
  subject_template VARCHAR(500) NOT NULL,
  body_template    TEXT         NOT NULL,
  language         VARCHAR(10)  NOT NULL DEFAULT 'ja',
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 9: notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID         REFERENCES tickets(id) ON DELETE CASCADE,
  recipient_id UUID         REFERENCES users(id) ON DELETE CASCADE,
  type         VARCHAR(100) NOT NULL,
  channel      VARCHAR(20)  NOT NULL DEFAULT 'email',
  sent_at      TIMESTAMPTZ,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 10: password_reset_tokens
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- TABLE 11: refresh_tokens
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- =============================================================================
-- Indexes
-- =============================================================================

-- tickets
CREATE INDEX IF NOT EXISTS idx_tickets_organisation_id  ON tickets (organisation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status           ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to_id   ON tickets (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at_desc  ON tickets (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_org_status       ON tickets (organisation_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number    ON tickets (ticket_number);

-- ticket_comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments (ticket_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id       ON audit_logs (ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organisation_id  ON audit_logs (organisation_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status ON notifications (recipient_id, status);


-- =============================================================================
-- updated_at trigger
-- Applied to: organisations, users, tickets
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop before (re)create so the script is safe to run multiple times
DROP TRIGGER IF EXISTS trg_organisations_updated_at ON organisations;
CREATE TRIGGER trg_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ── 1. SLA configs ────────────────────────────────────────────────────────────
INSERT INTO sla_configs (priority, first_response_hours, resolution_hours)
VALUES
  ('P1',  4.00, 16.00),
  ('P2',  8.00, 40.00),
  ('P3', 16.00, 80.00)
ON CONFLICT (priority) DO UPDATE
  SET first_response_hours = EXCLUDED.first_response_hours,
      resolution_hours     = EXCLUDED.resolution_hours,
      updated_at           = now();


-- ── 2. Email templates ────────────────────────────────────────────────────────
INSERT INTO email_templates (trigger_key, subject_template, body_template, language) VALUES

  -- ticket_created (ja) — sent to customer when a new ticket is opened
  (
    'ticket_created',
    '[{{ticket_number}}] お問い合わせを受け付けました: {{subject}}',
    '{{organisation_name}} ご担当者様,

お問い合わせ番号 {{ticket_number}} を受け付けました。

件名:     {{subject}}
優先度:   {{priority}}
カテゴリ: {{category}}

担当チームが確認次第ご連絡いたします。
進捗はこちらでご確認いただけます:
{{portal_link}}

よろしくお願いいたします。
Cubastion Nexus サポートチーム',
    'ja'
  ),

  -- agent_reply (ja) — sent to customer when an agent posts a public reply
  (
    'agent_reply',
    '[{{ticket_number}}] 担当者からの返答: {{subject}}',
    '{{organisation_name}} ご担当者様,

チケット {{ticket_number}} に {{agent_name}} より返答がございます。

件名: {{subject}}

{{reply_body}}

詳細はこちら:
{{portal_link}}

よろしくお願いいたします。
Cubastion Nexus サポートチーム',
    'ja'
  ),

  -- ticket_assigned_customer (ja) — sent to customer when an agent is assigned
  (
    'ticket_assigned_customer',
    '[{{ticket_number}}] 担当者が決定しました: {{subject}}',
    '{{organisation_name}} ご担当者様,

チケット {{ticket_number}} の担当者が {{agent_name}} に決定しました。

件名:   {{subject}}
優先度: {{priority}}

詳細はこちら:
{{portal_link}}

よろしくお願いいたします。
Cubastion Nexus サポートチーム',
    'ja'
  ),

  -- ticket_assigned_agent (en) — sent to agent when a ticket is assigned to them
  (
    'ticket_assigned_agent',
    '[{{ticket_number}}] Ticket Assigned to You: {{subject}}',
    'Hi {{agent_name}},

Ticket {{ticket_number}} has been assigned to you.

Subject:       {{subject}}
Organisation:  {{organisation_name}}
Priority:      {{priority}}
Category:      {{category}}
Submitted by:  {{customer_name}}

Please respond within the SLA window.

View ticket: {{portal_link}}

Cubastion Nexus Support',
    'en'
  ),

  -- ticket_escalated_customer (ja) — sent to customer when ticket is escalated
  (
    'ticket_escalated_customer',
    '[{{ticket_number}}] お問い合わせがエスカレーションされました: {{subject}}',
    '{{organisation_name}} ご担当者様,

チケット {{ticket_number}} は上位チームにエスカレーションされました。

件名:   {{subject}}
優先度: {{priority}}

引き続き優先的に対応いたします。
詳細はこちら:
{{portal_link}}

よろしくお願いいたします。
Cubastion Nexus サポートチーム',
    'ja'
  ),

  -- ticket_escalated_agents (en) — sent to agents when a ticket is escalated
  (
    'ticket_escalated_agents',
    '[ESCALATED] [{{ticket_number}}] Immediate Attention Required: {{subject}}',
    'Team,

Ticket {{ticket_number}} has been escalated and requires immediate attention.

Subject:       {{subject}}
Organisation:  {{organisation_name}}
Priority:      {{priority}}
Submitted by:  {{customer_name}}
Assigned to:   {{agent_name}}

Please review and respond within the SLA window.

View ticket: {{portal_link}}

Cubastion Nexus Support',
    'en'
  ),

  -- ticket_closed (ja) — sent to customer when ticket is closed
  (
    'ticket_closed',
    '[{{ticket_number}}] お問い合わせをクローズしました: {{subject}}',
    '{{organisation_name}} ご担当者様,

チケット {{ticket_number}} がクローズされました。

件名: {{subject}}

ご利用いただきありがとうございました。
追加のご質問がございましたら、同じポータルより新しいチケットをご作成ください。

詳細はこちら:
{{portal_link}}

よろしくお願いいたします。
Cubastion Nexus サポートチーム',
    'ja'
  ),

  -- new_ticket_agents (en) — sent to all agents when a new ticket is submitted
  (
    'new_ticket_agents',
    '[NEW] [{{ticket_number}}] New Ticket Submitted: {{subject}}',
    'Team,

A new support ticket has been submitted and requires assignment.

Ticket:        {{ticket_number}}
Subject:       {{subject}}
Organisation:  {{organisation_name}}
Priority:      {{priority}}
Category:      {{category}}
Submitted by:  {{customer_name}}

Please assign and respond within the SLA window.

View ticket: {{portal_link}}

Cubastion Nexus Support',
    'en'
  )

ON CONFLICT (trigger_key) DO NOTHING;


-- ── 3. Test organisation ──────────────────────────────────────────────────────
INSERT INTO organisations (name, inbound_email, primary_contact)
VALUES ('Fujikura Ltd', 'support.fujikura@cubastion.com', 'Tanaka Hiroshi')
ON CONFLICT (inbound_email) DO NOTHING;


-- ── 4. Test users ─────────────────────────────────────────────────────────────
-- Password for all three accounts: TempPass@123
-- Hash generated with bcrypt cost factor 12.
-- password_changed_at = NULL forces a password-change prompt on first login.
INSERT INTO users (organisation_id, email, name, role, password_hash, password_changed_at, is_active)
VALUES
  (
    NULL,
    'admin@cubastion.com',
    'Suzuki Akiko',
    'admin',
    '$2b$12$0u8aSbqo7U32QChqoLvbWevFPTDAYNwkYWBTrH9D4f.RMsqKVFjyq',
    NULL,
    true
  ),
  (
    NULL,
    'agent@cubastion.com',
    'Yamamoto Kenji',
    'agent',
    '$2b$12$0u8aSbqo7U32QChqoLvbWevFPTDAYNwkYWBTrH9D4f.RMsqKVFjyq',
    NULL,
    true
  ),
  (
    (SELECT id FROM organisations WHERE inbound_email = 'support.fujikura@cubastion.com'),
    'tanaka@fujikura.co.jp',
    'Tanaka Hiroshi',
    'customer',
    '$2b$12$0u8aSbqo7U32QChqoLvbWevFPTDAYNwkYWBTrH9D4f.RMsqKVFjyq',
    NULL,
    true
  )
ON CONFLICT (email) DO NOTHING;


-- =============================================================================
-- Idempotent column additions (safe to re-run)
-- =============================================================================

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_response_breached   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_resolution_breached  BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE attachments ADD COLUMN IF NOT EXISTS original_name VARCHAR(255);


-- =============================================================================
-- Verification
-- =============================================================================
DO $$
DECLARE
  tbl  TEXT;
  cnt  BIGINT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'organisations','users','sla_configs','tickets','ticket_comments',
    'attachments','audit_logs','email_templates','notifications','refresh_tokens'
  ] LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
    RAISE NOTICE 'Table %-25s rows: %', tbl, cnt;
  END LOOP;
END $$;
