# 📧 Brevo API Troubleshooting Guide

## Problem: Welcome Emails Not Arriving

If you're not receiving welcome emails when subscribing, follow this guide to diagnose the issue.

---

## ✅ Step 1: Test Brevo API Connection

### Using cURL (Terminal)

```bash
curl -X POST http://localhost:3000/api/admin/test-brevo \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Using Browser DevTools

1. Open http://localhost:3000/admin
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Paste this:

```javascript
fetch('http://localhost:3000/api/admin/test-brevo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-email@example.com' })
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)));
```

### Expected Success Response

```json
{
  "success": true,
  "message": "Brevo API test successful!",
  "configuration": {
    "apiKeyConfigured": true,
    "senderEmail": "noreply@newsletter.com",
    "senderName": "AI & SAP Newsletter",
    "testRecipient": "your-email@example.com"
  },
  "brevoResponse": {
    "messageId": "1234567890",
    "statusCode": 201
  },
  "nextSteps": [
    "✅ Brevo API is working correctly",
    "✅ Welcome emails should be delivered",
    ...
  ]
}
```

---

## ❌ Common Error Messages & Solutions

### Error 1: "Invalid API Key"

**Response:**
```json
{
  "success": false,
  "errorDetails": {
    "status": 401,
    "errorCode": "UNAUTHORIZED",
    "errorMessage": "The provided API key is invalid"
  }
}
```

**Solution:**
1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Click **Settings** → **SMTP & API**
3. Generate a new API key
4. Copy it to `.env` file:
   ```
   BREVO_API_KEY=xkeysib-xxx...your-new-key...xxx
   ```
5. Restart server: `npm start`

---

### Error 2: "Sender Email Not Verified"

**Response:**
```json
{
  "success": false,
  "errorDetails": {
    "status": 400,
    "errorCode": "INVALID_REQUEST",
    "errorMessage": "Sender is not verified"
  }
}
```

**Solution:**

**This is the MOST COMMON issue!**

Brevo requires you to verify the sender email before sending. Follow these steps:

1. **Log in to [Brevo Dashboard](https://app.brevo.com)**
2. Go to **Settings** → **Senders & Domains**
3. You'll see your sender email. Check if it's **VERIFIED** (green checkmark)
4. If NOT verified:
   - Click the email
   - Click **Send Verification Email**
   - Check your inbox for verification email
   - Click the verification link
   - Wait 5-10 minutes for Brevo to update

5. **Once Verified**, update `.env`:
   ```env
   BREVO_SENDER_EMAIL=your-verified-email@domain.com
   BREVO_SENDER_NAME=Your Name
   ```

6. **Restart the server:**
   ```bash
   npm start
   ```

---

### Error 3: "Quota Exceeded"

**Response:**
```json
{
  "success": false,
  "errorDetails": {
    "status": 429,
    "errorMessage": "Rate limit exceeded"
  }
}
```

**Solution:**
- You've exceeded Brevo's free tier limits
- Check [Brevo Pricing](https://www.brevo.com/pricing/)
- Upgrade your account if needed
- Or wait for daily quota to reset

---

### Error 4: "Invalid Request"

**Response:**
```json
{
  "success": false,
  "errorDetails": {
    "status": 400,
    "errorMessage": "Invalid request parameters"
  }
}
```

**Solution:**
- The email payload structure might be wrong
- Check that `htmlContent` is valid HTML
- Check that email addresses are properly formatted
- The server logs will show more details

---

## 🔍 Server Logs - Check These for Debugging

When you test, **the server terminal will show detailed logs**:

### Successful Email Send:
```
📧 Preparing to send email to: john@example.com
🔧 Brevo API Call Details:
   URL: https://api.brevo.com/v3/smtp/email
   From: noreply@newsletter.com (AI & SAP Newsletter)
   To: john@example.com (John)
   Subject: 🎉 Welcome to Kaar AI Newsletter!
   API Key Present: YES
✅ Email sent successfully! Message ID: 1234567890
```

### Failed Email Send - Unverified Sender:
```
❌ Error sending email via Brevo:
   Status: 400
   Error: Sender is not verified
   Full Response: {
     "code": "INVALID_REQUEST",
     "message": "Sender is not verified"
   }
```

### Failed Email Send - Invalid API Key:
```
❌ Error sending email via Brevo:
   Status: 401
   Error: The provided API key is invalid
   Full Response: {
     "code": "UNAUTHORIZED",
     "message": "The provided API key is invalid"
   }
```

---

## 📋 Complete Brevo Setup Checklist

Follow these steps to ensure Brevo is correctly configured:

### 1. API Key Setup
- [ ] Log in to [Brevo Dashboard](https://app.brevo.com)
- [ ] Go to Settings → SMTP & API
- [ ] Copy your API Key (starts with `xkeysib-`)
- [ ] Paste in `.env` file: `BREVO_API_KEY=xkeysib-...`
- [ ] Verify it's the full key with no spaces

### 2. Sender Verification
- [ ] In Brevo Dashboard, go to Settings → Senders
- [ ] Check if your sender email has a **GREEN CHECKMARK** (verified)
- [ ] If not verified:
  - [ ] Click on the sender email
  - [ ] Click "Send Verification Email"
  - [ ] Check your inbox
  - [ ] Click verification link
  - [ ] Wait 5-10 minutes

### 3. Environment Configuration
- [ ] Sender email matches verified email in Brevo
- [ ] Update `.env`:
  ```env
  BREVO_API_KEY=xkeysib-xxxxx
  BREVO_SENDER_EMAIL=your-verified@email.com
  BREVO_SENDER_NAME=Your Name
  ```

### 4. Server Restart
- [ ] Kill current server: `Ctrl+C`
- [ ] Restart: `npm start`
- [ ] Wait for "🚀 Newsletter Server running" message

### 5. Test Email Sending
- [ ] Run the Brevo test:
  ```bash
  curl -X POST http://localhost:3000/api/admin/test-brevo \
    -H "Content-Type: application/json" \
    -d '{"email":"test@gmail.com"}'
  ```
- [ ] Check response for success message
- [ ] Check your test email inbox

### 6. Test Welcome Email
- [ ] Visit http://localhost:3000
- [ ] Register with email and name
- [ ] Choose topic preference
- [ ] Click "Subscribe Now"
- [ ] Check inbox for welcome email (< 2 seconds)
- [ ] If not received, check server logs for errors

---

## 🚀 Email Sending Code (For Reference)

The system uses this code to send emails to Brevo:

```javascript
// File: backend/services/brevoService.js

const payload = {
  sender: {
    email: "your-verified@email.com",    // Must be verified in Brevo!
    name: "AI & SAP Newsletter"
  },
  to: [
    {
      email: "recipient@example.com",     // Subscriber's email
      name: "Recipient Name"
    }
  ],
  subject: "🎉 Welcome to Kaar AI Newsletter!",
  htmlContent: "<html>...beautiful email template...</html>",
  replyTo: {
    email: "your-verified@email.com",
    name: "AI & SAP Newsletter"
  }
};

// API Call
POST https://api.brevo.com/v3/smtp/email
Headers: {
  'api-key': 'xkeysib-your-api-key',
  'content-type': 'application/json'
}
Body: payload
```

---

## 🔐 API Key Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (it's in `.gitignore`)
- Your Brevo API key is sensitive - don't share it
- If exposed, regenerate it in Brevo Dashboard
- Currently in `.env` for development only
- For production, use environment secrets/vault

---

## 📞 Quick Troubleshooting Flow

```
Email not arriving?
   ↓
Run test: POST /api/admin/test-brevo
   ↓
   ├─→ ✅ Success?
   │   └─→ Sender is verified ✓
   │       Check: Is welcome email being sent?
   │       Server logs show "Email sent successfully"
   │       → Check spam folder
   │       → Check unsubscribe link was clicked
   │
   └─→ ❌ Failed?
       ├─→ "Sender is not verified"?
       │   └─→ Verify sender in Brevo Dashboard
       │
       ├─→ "Invalid API Key"?
       │   └─→ Generate new API key in Brevo
       │
       └─→ Other error?
           └─→ Check server logs for details
```

---

## 📊 Testing Email Sending

### Method 1: Direct API Test
```bash
curl -X POST http://localhost:3000/api/admin/test-brevo \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Method 2: Test Full Newsletter Email
```bash
curl -X POST http://localhost:3000/api/admin/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"your-email@example.com",
    "testType":"full-newsletter"
  }'
```

### Method 3: Test Simple Email
```bash
curl -X POST http://localhost:3000/api/admin/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email":"your-email@example.com",
    "testType":"simple"
  }'
```

### Method 4: Actual Subscription Test
1. Visit http://localhost:3000
2. Fill form: Name, Email, Topic
3. Click Subscribe
4. Check inbox for welcome email

---

## ✅ Final Verification

When everything is working:

✅ **Brevo Test Email:**
- POST /api/admin/test-brevo returns success
- Email arrives in < 2 seconds
- Shows "Brevo API Test Success"

✅ **Welcome Email on Subscribe:**
- User fills subscription form
- Clicks "Subscribe Now"
- Success modal shows "Welcome email sent!"
- Welcome email arrives in < 2 seconds
- Email is personalized with user's name
- Email shows topic preference

✅ **Admin Panel:**
- Can send test emails
- Delivery stats show sent/received
- Email logs tracked in database

---

## 💡 Pro Tips

1. **Use Gmail for Testing:**
   - Gmail has good Brevo support
   - Creates filters automatically
   - Easy to check for issues

2. **Check Spam Folder:**
   - Some emails end up in spam initially
   - Once you mark as "Not Spam", future emails go to inbox

3. **Save to Contacts:**
   - Ask users to save your sender email to contacts
   - Increases deliverability

4. **Monitor Brevo Dashboard:**
   - Check sending logs in Brevo
   - Monitor bounce rates
   - Check unsubscribe rates

5. **Test Regularly:**
   - Run test-brevo after updating configuration
   - Test welcome email after code changes
   - Monitor first few subscriber emails

---

## 🎯 Next Steps

1. **Verify Brevo Sender Email** (Most Important!)
   - Log in to Brevo
   - Check sender verification status
   - Complete verification if needed

2. **Test Connection**
   - Run POST /api/admin/test-brevo
   - Check response for success

3. **Subscribe and Verify**
   - Register new subscriber
   - Check inbox for welcome email
   - Verify email formatting and content

4. **Monitor Logs**
   - Check server console for errors
   - Use Brevo dashboard to verify delivery

---

**Last Updated:** May 13, 2026
**Status:** Troubleshooting Guide Complete ✅
