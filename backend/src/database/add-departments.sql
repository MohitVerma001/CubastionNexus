-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add department_id to users table (for agents only)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS department_id UUID
  REFERENCES departments(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_users_department
  ON users(department_id);

-- Seed some default departments
INSERT INTO departments (name, description) VALUES
  ('Technical Support', 'Handles system and technical issues'),
  ('Functional Support', 'Handles functional and business process issues'),
  ('Data Support', 'Handles data issues and data management requests'),
  ('Account Management', 'Handles user management and account requests')
ON CONFLICT (name) DO NOTHING;
