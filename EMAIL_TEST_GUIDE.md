# 📧 Brevo Email Integration Test Guide

## Overview

The test email feature allows you to verify that your Brevo API integration is working correctly before sending newsletters to actual subscribers.

## 🚀 Quick Start

### Access Test Email Feature

1. **Open Admin Panel**
   - Navigate to: http://localhost:3000/admin
   - Login: `admin` / `admin123`

2. **Go to Newsletter Tab**
   - Click on the "Newsletter" tab in the dashboard

3. **Find Test Email Buttons**
   - You'll see two buttons:
     - 📧 **Send Test Email** - Simple integration test
     - 🧪 **Test Full Newsletter** - Send actual newsletter content

---

## 📤 Test Email Types

### 1. Simple Test Email (Recommended First)

**Purpose:** Verify basic Brevo API connectivity

**What It Does:**
- Sends a simple verification email
- Confirms API credentials are correct
- Shows delivery timestamp
- Tests SMTP configuration

**How to Use:**
1. Click "📧 Send Test Email" button
2. Enter your email address
3. Select "Simple Test Email" from dropdown
4. Click "Send Test Email"
5. Check your inbox (within 1-2 seconds)

**Expected Result:**
```
Subject: ✅ Test Email - Brevo Integration Working

Content:
✅ Success! This test email was sent successfully via Brevo API.

📧 Test Details:
• Email Service: Brevo (Sendinblue)
• Timestamp: [ISO timestamp]
• Status: ✓ Delivered
• Integration: Fully Functional
```

---

### 2. Full Newsletter Test

**Purpose:** Test the complete newsletter with actual content

**What It Does:**
- Fetches today's newsletter from database
- Uses all formatting and styling
- Includes real articles and inspirational quotes
- Tests personalization engine
- Confirms email template rendering

**How to Use:**

**Option A: Via Modal**
1. Click "📧 Send Test Email" button
2. Enter your email address
3. Select "Full Newsletter Test" from dropdown
4. Click "Send Test Email"
5. Wait for newsletter to arrive

**Option B: Via Quick Button**
1. Click "🧪 Test Full Newsletter" button
2. Enter your email when prompted
3. Newsletter sent immediately

**Expected Result:**
```
Subject: 🧪 TEST: AI & SAP Daily News - [Today's Date]

Content:
[Complete newsletter with:]
- Header and styling
- Top 5 AI news articles
- Top 5 SAP+AI news articles
- Inspirational quote
- Formatted HTML layout
- Footer with unsubscribe options
```

---

## ✅ Testing Checklist

### Before Going Live

- [ ] **Test Simple Email**
  - [ ] Email received within 2 seconds
  - [ ] Brevo confirmation message displays
  - [ ] Check spam/junk folder

- [ ] **Test Full Newsletter**
  - [ ] Newsletter HTML renders correctly
  - [ ] All articles display properly
  - [ ] Images/styling look good
  - [ ] Links are clickable
  - [ ] Quote displays correctly

- [ ] **Verify API Credentials**
  - [ ] No "Unauthorized" errors
  - [ ] No "Quota exceeded" errors
  - [ ] Message IDs returned successfully

- [ ] **Check Admin Dashboard**
  - [ ] Test emails logged in email_logs table
  - [ ] Delivery stats updated
  - [ ] No error messages in console

---

## 🔍 Troubleshooting

### Email Not Received

**Problem:** Test email sent successfully but not in inbox

**Solutions:**
1. Check spam/junk folder
2. Check your email filtering rules
3. Verify email address is correct
4. Wait a few more seconds (can take 3-5 seconds)

**Debug:**
- Check browser console for error messages
- Check server terminal for API errors
- Verify Brevo API key in .env file

---

### "Brevo Integration Failed" Error

**Problem:** Test email fails with Brevo error

**Possible Causes:**
1. Invalid API key in .env
2. Brevo account quota exceeded
3. Network connectivity issue
4. Email address already unsubscribed in Brevo

**Solutions:**
```bash
# 1. Verify API key in .env
cat .env | grep BREVO_API_KEY

# 2. Check if API key is correct
# Visit: https://app.brevo.com/account/smtp-api

# 3. Verify Brevo account status
# Login to: https://app.brevo.com

# 4. Restart server
npm start
```

---

### "No newsletter for today" Error

**Problem:** Full newsletter test fails - no content

**Cause:** News hasn't been fetched yet for today

**Solutions:**
1. Wait until 3 AM (automatic news fetch)
2. Or manually trigger news fetch:
   ```bash
   npm run fetch-news
   ```
3. Then try full newsletter test again

---

## 📊 Test Results

### Success Response

```json
{
  "success": true,
  "message": "Test email sent successfully to user@example.com",
  "messageId": "brevo_message_id_xxxxx",
  "timestamp": "2026-05-12T14:30:00.000Z"
}
```

### Error Response

```json
{
  "error": "Failed to send test email",
  "details": "Invalid API key or account issue"
}
```

---

## 🔐 API Endpoint Reference

### Send Test Email

**Endpoint:** `POST /api/admin/send-test-email`

**Request Body:**
```json
{
  "email": "test@example.com",
  "testType": "simple" // or "full-newsletter"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com",
  "messageId": "1234567890",
  "timestamp": "2026-05-12T14:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/admin/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "testType": "simple"
  }'
```

---

## 📋 Test Scenarios

### Scenario 1: Initial Setup Verification

**Goal:** Confirm all integrations are working

**Steps:**
1. Start the server: `npm start`
2. Initialize database: `npm run init-db`
3. Login to admin panel: http://localhost:3000/admin
4. Send simple test email
5. Verify email received

**Expected Outcome:** ✅ Email received, integration working

---

### Scenario 2: Newsletter Content Verification

**Goal:** Confirm newsletter rendering is correct

**Steps:**
1. Ensure news has been fetched (or run `npm run fetch-news`)
2. Send full newsletter test
3. Check email formatting
4. Verify all content sections present
5. Test link clicks

**Expected Outcome:** ✅ Newsletter looks good, all sections present

---

### Scenario 3: Multiple Recipient Test

**Goal:** Test sending to different email providers

**Steps:**
1. Send test to Gmail account
2. Send test to Outlook account
3. Send test to corporate email
4. Verify formatting across providers

**Expected Outcome:** ✅ Consistent rendering across all providers

---

## 🎯 Performance Metrics

| Metric | Expected | Notes |
|--------|----------|-------|
| Simple Test Delivery | < 2 seconds | Brevo standard |
| Full Newsletter Delivery | < 3 seconds | Larger payload |
| API Response Time | < 1 second | Brevo latency |
| Database Query | < 100ms | SQLite performance |

---

## 📞 Support

### Common Questions

**Q: Can I send test emails to multiple addresses?**
A: Not in one go, but you can send multiple tests sequentially.

**Q: Does test email count against my Brevo quota?**
A: Yes, each test email counts as one sent email.

**Q: Can I customize the test email content?**
A: Simple tests use fixed content. For custom content, modify the route.

**Q: How often can I test?**
A: Unlimited, but check your Brevo plan limits.

---

## 🚀 Production Readiness

Once you've completed all tests and verified:
- ✅ Emails receive successfully
- ✅ Content renders correctly
- ✅ No error messages
- ✅ Brevo integration working

**You're ready to:**
1. Register real subscribers
2. Wait for 3 AM news fetch
3. Wait for 6 AM newsletter send
4. Monitor delivery in admin dashboard

---

## 🔗 Useful Links

- [Brevo Documentation](https://developers.brevo.com/)
- [Brevo Dashboard](https://app.brevo.com)
- [API Key Management](https://app.brevo.com/account/smtp-api)
- [Email Testing Tools](https://www.mail-tester.com)

---

**Last Updated:** May 12, 2026
**Status:** Ready for Testing ✅
