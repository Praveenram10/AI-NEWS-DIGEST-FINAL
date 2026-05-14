const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbRun, dbGet, dbAll } = require('../database/db');

// Simple admin auth middleware
function adminAuth(req, res, next) {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME) {
    // In production, compare with hashed password
    if (password === 'admin123') {  // Demo password
      next();
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Simple auth (in production, use bcrypt comparison)
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        token: 'admin-token-' + Date.now(),
        message: 'Login successful'
      });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Get all subscribers
 */
router.get('/subscribers', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const subscribers = await dbAll(
      `SELECT id, email, name, topic_preference, subscribed_at, is_active
       FROM subscribers
       ORDER BY subscribed_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const total = await dbGet('SELECT COUNT(*) as count FROM subscribers');

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting subscribers:', error);
    res.status(500).json({ error: 'Failed to get subscribers' });
  }
});

/**
 * Delete subscriber
 */
router.delete('/subscribers/:id', async (req, res) => {
  try {
    const result = await dbRun(
      'DELETE FROM subscribers WHERE id = ?',
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    // Log action
    await dbRun(
      'INSERT INTO admin_logs (action, details) VALUES (?, ?)',
      ['delete_subscriber', `Deleted subscriber ID: ${req.params.id}`]
    );

    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

/**
 * Get delivery statistics
 */
router.get('/delivery-stats', async (req, res) => {
  try {
    const stats = await dbGet(
      `SELECT 
        COUNT(DISTINCT newsletter_id) as total_newsletters_sent,
        COUNT(*) as total_emails_sent,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM email_logs`
    );

    const recentNewsletters = await dbAll(
      `SELECT id, date, sent_at, 
        (SELECT COUNT(*) FROM email_logs WHERE email_logs.newsletter_id = newsletters.id AND status = 'sent') as sent_count,
        (SELECT COUNT(*) FROM email_logs WHERE email_logs.newsletter_id = newsletters.id AND status = 'failed') as failed_count
       FROM newsletters
       WHERE sent_at IS NOT NULL
       ORDER BY date DESC
       LIMIT 10`
    );

    res.json({
      overall: stats,
      recent: recentNewsletters
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Get today's newsletter
 */
router.get('/newsletter/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const newsletter = await dbGet(
      'SELECT * FROM newsletters WHERE date = ?',
      [today]
    );

    if (!newsletter) {
      return res.status(404).json({ error: 'No newsletter for today' });
    }

    res.json({
      ...newsletter,
      ai_articles: JSON.parse(newsletter.ai_articles),
      sap_ai_articles: JSON.parse(newsletter.sap_ai_articles)
    });
  } catch (error) {
    console.error('Error getting newsletter:', error);
    res.status(500).json({ error: 'Failed to get newsletter' });
  }
});

/**
 * Update newsletter
 */
router.put('/newsletter/today', async (req, res) => {
  try {
    const { aiArticles, sapAiArticles, inspirationalQuote } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = await dbRun(
      `UPDATE newsletters 
       SET ai_articles = ?, sap_ai_articles = ?, inspirational_quote = ?
       WHERE date = ?`,
      [
        JSON.stringify(aiArticles),
        JSON.stringify(sapAiArticles),
        inspirationalQuote,
        today
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    // Log action
    await dbRun(
      'INSERT INTO admin_logs (action, details) VALUES (?, ?)',
      ['update_newsletter', `Updated newsletter for ${today}`]
    );

    res.json({ success: true, message: 'Newsletter updated' });
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Failed to update newsletter' });
  }
});

/**
 * Send test email
 */
router.post('/send-test-email', async (req, res) => {
  try {
    const { email, testType = 'simple' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const { sendEmail } = require('../services/brevoService');

    let subject, htmlContent;

    if (testType === 'full-newsletter') {
      // Send a test with actual newsletter content
      const today = new Date().toISOString().split('T')[0];
      const newsletter = await dbGet(
        'SELECT * FROM newsletters WHERE date = ?',
        [today]
      );

      if (!newsletter) {
        return res.status(404).json({ error: 'No newsletter for today to test' });
      }

      const { generateEmailHTML } = require('../services/emailService');
      const aiArticles = JSON.parse(newsletter.ai_articles);
      const sapAiArticles = JSON.parse(newsletter.sap_ai_articles);
      const quote = newsletter.inspirational_quote;

      subject = `🧪 TEST: AI & SAP Daily News - ${new Date().toLocaleDateString()}`;
      htmlContent = generateEmailHTML(
        'Test User',
        aiArticles,
        sapAiArticles,
        quote,
        'both'
      );
    } else {
      // Send a simple test email
      subject = '✅ Test Email - Brevo Integration Working';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #667eea; margin: 0; }
            .content { margin: 20px 0; }
            .success { background: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 6px; border-left: 4px solid #2e7d32; }
            .info { background: #e3f2fd; color: #1565c0; padding: 15px; border-radius: 6px; border-left: 4px solid #1565c0; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Brevo Integration Test</h1>
            </div>
            
            <div class="content">
              <div class="success">
                <strong>✅ Success!</strong> This test email was sent successfully via Brevo API.
              </div>

              <div class="info">
                <strong>📧 Test Details:</strong><br>
                • Email Service: Brevo (Sendinblue)<br>
                • Timestamp: ${new Date().toISOString()}<br>
                • Status: ✓ Delivered<br>
                • Integration: Fully Functional
              </div>

              <p>If you received this email, your Brevo integration is working perfectly! 🚀</p>

              <p>The AI & SAP Newsletter system is ready to:</p>
              <ul>
                <li>✓ Register subscribers</li>
                <li>✓ Fetch daily news from Gemini API</li>
                <li>✓ Send personalized newsletters</li>
                <li>✓ Track delivery metrics</li>
              </ul>

              <p style="margin-top: 30px; padding: 15px; background: #fff3e0; border-radius: 6px;">
                <strong>🔧 Next Steps:</strong><br>
                • Test full newsletter: Send a test with actual newsletter content<br>
                • Register subscribers: Visit http://localhost:3000<br>
                • Monitor dashboard: http://localhost:3000/admin
              </p>
            </div>

            <div class="footer">
              <p>AI & SAP Newsletter System | Powered by Brevo API</p>
              <p>This is a test email from the admin panel</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const result = await sendEmail(email, 'Test User', subject, htmlContent);

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        error: 'Failed to send test email',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

/**
 * Test Brevo API connectivity (for debugging)
 */
router.post('/test-brevo', async (req, res) => {
  try {
    const { email = 'test@example.com' } = req.body;

    console.log('\n🔍 BREVO API TEST - Debug Information:');
    console.log('=========================================');
    
    // Check environment variables
    const brevoKey = process.env.BREVO_API_KEY;
    const brevoSender = process.env.BREVO_SENDER_EMAIL;
    const breevoSenderName = process.env.BREVO_SENDER_NAME;

    console.log('📋 Configuration Check:');
    console.log(`   API Key Set: ${brevoKey ? '✅ YES' : '❌ NO'}`);
    console.log(`   API Key Length: ${brevoKey ? brevoKey.length : 0} characters`);
    console.log(`   Sender Email: ${brevoSender || 'NOT SET (using default)'}`);
    console.log(`   Sender Name: ${breevoSenderName || 'NOT SET (using default)'}`);
    console.log(`   Recipient Email: ${email}`);

    // Make direct API call with full details
    const axios = require('axios');
    const BREVO_API_URL = 'https://api.brevo.com/v3';

    const testPayload = {
      sender: {
        email: brevoSender || 'noreply@newsletter.com',
        name: breevoSenderName || 'AI & SAP Newsletter'
      },
      to: [
        {
          email: email,
          name: 'Test Recipient'
        }
      ],
      subject: '🧪 Brevo API Direct Test',
      htmlContent: `
        <html>
          <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: #667eea; text-align: center;">🎉 Brevo API Test Success!</h1>
              
              <div style="background: #e8f5e9; color: #2e7d32; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2e7d32;">
                <strong>✅ Your Brevo API is configured correctly!</strong>
              </div>

              <div style="background: #e3f2fd; color: #1565c0; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1565c0;">
                <strong>📊 Test Details:</strong><br>
                From: ${brevoSender || 'noreply@newsletter.com'}<br>
                To: ${email}<br>
                Time: ${new Date().toISOString()}<br>
                Status: ✅ DELIVERED
              </div>

              <p style="color: #555; line-height: 1.6;">
                This confirms that your Brevo API integration is working properly. 
                Welcome emails should now be delivered successfully to all subscribers!
              </p>

              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="text-align: center; color: #999; font-size: 12px;">
                Kaar AI Newsletter | Powered by Brevo
              </p>
            </div>
          </body>
        </html>
      `
    };

    console.log('\n📤 Sending Test Email:');
    console.log(`   To: ${email}`);
    console.log(`   From: ${testPayload.sender.email}`);
    console.log(`   Endpoint: ${BREVO_API_URL}/smtp/email`);

    const response = await axios.post(`${BREVO_API_URL}/smtp/email`, testPayload, {
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      timeout: 10000
    });

    console.log('\n✅ SUCCESS:');
    console.log(`   Message ID: ${response.data.messageId}`);
    console.log(`   Status Code: ${response.status}`);
    console.log('=========================================\n');

    return res.json({
      success: true,
      message: 'Brevo API test successful!',
      configuration: {
        apiKeyConfigured: !!brevoKey,
        senderEmail: brevoSender || 'noreply@newsletter.com (default)',
        senderName: breevoSenderName || 'AI & SAP Newsletter (default)',
        testRecipient: email
      },
      brevoResponse: {
        messageId: response.data.messageId,
        statusCode: response.status
      },
      nextSteps: [
        '✅ Brevo API is working correctly',
        '✅ Welcome emails should be delivered',
        '✅ Test newsletter signup at http://localhost:3000',
        '✅ Check email for welcome message'
      ]
    });

  } catch (error) {
    console.error('\n❌ BREVO API TEST FAILED:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error Details: ${JSON.stringify(error.response?.data, null, 2)}`);
    console.error('=========================================\n');

    return res.status(500).json({
      success: false,
      error: 'Brevo API test failed',
      errorDetails: {
        message: error.message,
        status: error.response?.status,
        errorCode: error.response?.data?.code,
        errorMessage: error.response?.data?.message,
        fullResponse: error.response?.data
      },
      possibleIssues: [
        '❌ API Key is invalid or expired',
        '❌ Sender email is not verified in Brevo',
        '❌ API endpoint is unreachable',
        '❌ Brevo account has reached quota limit',
        '❌ Network connection issue'
      ],
      troubleshooting: {
        verifyApiKey: 'Check .env file BREVO_API_KEY value',
        verifySender: 'Log in to Brevo > Settings > Senders to verify email is approved',
        checkQuota: 'Check Brevo dashboard for sending quota',
        checkNetwork: 'Ensure internet connection is active'
      }
    });
  }
});

/**
 * Send manual newsletter to specific emails
 */
router.post('/send-manual-newsletter', async (req, res) => {
  try {
    const { emails = [], newsletterId = null } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: 'No emails provided' });
    }

    // Validate emails
    const validEmails = emails.filter(email => 
      email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    );

    if (validEmails.length === 0) {
      return res.status(400).json({ error: 'No valid emails provided' });
    }

    const { sendEmail } = require('../services/brevoService');
    const { generateEmailHTML } = require('../services/emailService');

    // Get newsletter data
    let newsletter;
    if (newsletterId) {
      newsletter = await dbGet(
        'SELECT * FROM newsletters WHERE id = ?',
        [newsletterId]
      );
    } else {
      // Use today's newsletter
      const today = new Date().toISOString().split('T')[0];
      newsletter = await dbGet(
        'SELECT * FROM newsletters WHERE date = ?',
        [today]
      );
    }

    if (!newsletter) {
      return res.status(404).json({ error: 'No newsletter found' });
    }

    const aiArticles = JSON.parse(newsletter.ai_articles);
    const sapAiArticles = JSON.parse(newsletter.sap_ai_articles);
    const quote = newsletter.inspirational_quote;

    console.log(`\n📧 Manual Newsletter Send - Admin Triggered`);
    console.log(`Sending to ${validEmails.length} recipient(s)...`);

    const results = {
      success: [],
      failed: []
    };

    // Send to each email
    for (const email of validEmails) {
      try {
        // Get subscriber info if available
        const subscriber = await dbGet(
          'SELECT id, name, topic_preference FROM subscribers WHERE email = ?',
          [email]
        );

        const name = subscriber?.name || 'Valued Subscriber';
        const topicPref = subscriber?.topic_preference || 'both';

        // Generate personalized email
        const htmlContent = generateEmailHTML(name, aiArticles, sapAiArticles, quote, topicPref);

        // Send via Brevo
        const result = await sendEmail(
          email,
          name,
          `📰 AI & SAP Daily News - ${new Date().toLocaleDateString()}`,
          htmlContent
        );

        if (result.success) {
          // Log delivery
          await dbRun(
            `INSERT INTO email_logs (subscriber_id, newsletter_id, status, brevo_message_id, sent_at)
             VALUES (?, ?, ?, ?, ?)`,
            [subscriber?.id || null, newsletter.id, 'sent', result.messageId, new Date().toISOString()]
          );

          results.success.push({
            email: email,
            messageId: result.messageId,
            status: 'sent'
          });

          console.log(`✅ Sent to: ${email}`);
        } else {
          results.failed.push({
            email: email,
            error: result.error,
            status: 'failed'
          });

          console.log(`❌ Failed to send to: ${email} - ${result.error}`);
        }
      } catch (error) {
        results.failed.push({
          email: email,
          error: error.message,
          status: 'failed'
        });

        console.log(`❌ Error sending to ${email}: ${error.message}`);
      }
    }

    console.log(`\n📊 Manual Send Results:`);
    console.log(`   ✅ Success: ${results.success.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}\n`);

    res.json({
      success: true,
      message: `Newsletter sent to ${results.success.length} recipients`,
      results: results,
      summary: {
        total: validEmails.length,
        successful: results.success.length,
        failed: results.failed.length
      }
    });

  } catch (error) {
    console.error('Error sending manual newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter: ' + error.message });
  }
});

/**
 * Get all subscribers list (for manual send)
 */
router.get('/subscribers-list', async (req, res) => {
  try {
    const subscribers = await dbAll(
      'SELECT id, email, name, topic_preference, is_active FROM subscribers WHERE is_active = 1 ORDER BY email'
    );

    res.json({
      success: true,
      count: subscribers.length,
      subscribers: subscribers
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

module.exports = router;
