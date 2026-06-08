# Manual Testing Guide

## Reset Test Users
Run this in psql before testing:
```sql
UPDATE users SET
  password_hash = '$2b$12$oyLGkSh7ad0fJ3hfPTucFOx7eHQiPvwDeSvrm6JE0fkzjmtMuSzQu',
  password_changed_at = NULL,
  failed_login_attempts = 0,
  locked_until = NULL
WHERE email IN ('admin@cubastion.com', 'agent@cubastion.com', 'tanaka@fujikura.co.jp');
```

## Test 1 — Password Change Loop Fix
1. Open http://localhost:5173
2. Login with tanaka@fujikura.co.jp / TempPass@123
3. You should see the Change Password screen — this is correct
4. Enter current password: TempPass@123
5. Enter new password: NewPass@2024!
6. Enter confirm password: NewPass@2024!
7. Click Update Password
8. You should be redirected to the customer dashboard
9. Click logout
10. Login again with tanaka@fujikura.co.jp / NewPass@2024!
11. You should go DIRECTLY to the customer dashboard
12. If you see the change password screen again — the fix failed

## Test 2 — Organisation in New Ticket Form
1. Login as customer (tanaka@fujikura.co.jp)
2. Click New Ticket
3. The Organisation field should show: Fujikura Ltd
4. If it shows blank or undefined — report this

## Test 3 — Organisation Dropdown in User Creation
1. Login as admin (admin@cubastion.com)
2. Go to Users page
3. Click Create User or Add User button
4. Set Role to Customer
5. The Organisation field should show a dropdown with Fujikura Ltd
6. If it shows a text input — report this

## Test 4 — Create a Ticket
1. Login as customer
2. Click New Ticket
3. Fill in Subject: Test ticket one
4. Fill in Description: This is my first test ticket description
5. Select Category: System Issue
6. Select Priority: P3
7. Click Submit
8. You should be redirected to the ticket list
9. The new ticket should appear with a CUB-XXXXX number

## Test 5 — Agent Views Ticket
1. Login as agent (agent@cubastion.com / TempPass@123)
2. You will be asked to change password first — do it
3. Go to the agent dashboard
4. The ticket created in Test 4 should appear in the list
5. Click the ticket
6. You should see the full ticket detail
