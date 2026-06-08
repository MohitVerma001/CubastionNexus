-- Reset all three test users to TempPass@123 with forced password change
UPDATE users SET
  password_hash = '$2b$12$oyLGkSh7ad0fJ3hfPTucFOx7eHQiPvwDeSvrm6JE0fkzjmtMuSzQu',
  password_changed_at = NULL,
  failed_login_attempts = 0,
  locked_until = NULL
WHERE email IN ('admin@cubastion.com', 'agent@cubastion.com', 'tanaka@fujikura.co.jp');
