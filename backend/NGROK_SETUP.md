# Setting Up Email Ingestion with SendGrid + ngrok

## Step 1 — Install ngrok
npm install -g ngrok
ngrok config add-authtoken YOUR_NGROK_TOKEN
(Get free token from https://ngrok.com)

## Step 2 — Start ngrok (run in a separate terminal)
ngrok http 3001

## Step 3 — Copy the ngrok URL
You will see something like:
Forwarding https://abc123.ngrok.io -> localhost:3001

Copy the https URL.

## Step 4 — Configure SendGrid Inbound Parse
1. Go to https://app.sendgrid.com
2. Settings → Inbound Parse
3. Click Add Host & URL
4. Hostname: cubastion.com
5. URL: https://YOUR_NGROK_URL/api/v1/webhooks/email-inbound
6. Check "POST the raw, full MIME message"  
7. Save

## Step 5 — Test without SendGrid (local simulation)
curl -X POST http://localhost:3001/api/v1/webhooks/email-inbound/simulate \
  -H "Content-Type: application/json" \
  -d "{\"from_email\":\"varun.ahuja@cubastion.com\",\"subject\":\"My system is down\",\"text\":\"The login page is showing error 500.\"}"

Expected response: {"success":true}
Check backend logs for: "Inbound email webhook received"
Check database: SELECT * FROM tickets ORDER BY created_at DESC LIMIT 1;

## Step 6 — Test with real email
Send an email from varun.ahuja@cubastion.com 
to mohit.verma@cubastion.com
Subject: Test ticket via email
Body: This is a test

Within 30 seconds check the portal — a new ticket should appear.

## Troubleshooting
- If no ticket created: check backend logs for error messages
- If "unknown sender": the email address is not registered as a user
- If rate limited: the webhook route was hitting apiLimiter (should be fixed)
- ngrok URL changes every restart — update SendGrid each time
