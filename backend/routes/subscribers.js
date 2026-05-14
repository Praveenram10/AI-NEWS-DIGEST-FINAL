const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { dbRun, dbGet, dbAll } = require('../database/db');
const { addContact, sendEmail } = require('../services/brevoService');

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmailHTML(name, topicPreference) {
  const getTopicDescription = (pref) => {
    switch(pref) {
      case 'ai-only':
        return {
          emoji: '🤖',
          title: 'AI News Only',
          description: 'You\'ll receive daily curated AI news including breakthroughs, new products, research, and more.'
        };
      case 'sap-ai':
        return {
          emoji: '💼',
          title: 'SAP + AI News',
          description: 'You\'ll receive daily enterprise AI and SAP solutions news including S/4HANA AI, business automation, and more.'
        };
      case 'both':
        return {
          emoji: '🌟',
          title: 'Complete Coverage',
          description: 'You\'ll receive both AI news AND SAP+AI enterprise news - complete coverage of everything!'
        };
      default:
        return { emoji: '📰', title: 'AI & SAP News', description: 'Daily curated news' };
    }
  };

  const topic = getTopicDescription(topicPreference);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #667eea; font-size: 36px; margin: 0 0 10px 0; }
        .header p { color: #5f6368; font-size: 14px; margin: 0; }
        .welcome-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
        .welcome-box h2 { margin: 0 0 15px 0; font-size: 24px; }
        .welcome-box p { margin: 0; font-size: 16px; line-height: 1.6; }
        .topic-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
        .topic-section .emoji { font-size: 32px; display: block; margin-bottom: 10px; }
        .topic-section h3 { color: #667eea; margin: 10px 0 5px 0; font-size: 18px; }
        .topic-section p { color: #5f6368; margin: 0; font-size: 14px; line-height: 1.6; }
        .benefits { margin: 30px 0; }
        .benefits h3 { color: #202124; font-size: 18px; margin-bottom: 15px; }
        .benefit-item { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .benefit-item .icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }
        .benefit-item .text { flex: 1; }
        .benefit-item strong { display: block; color: #202124; margin-bottom: 3px; }
        .benefit-item p { color: #5f6368; font-size: 13px; margin: 0; }
        .schedule-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .schedule-section h3 { color: #1565c0; margin-top: 0; }
        .schedule-item { margin: 12px 0; color: #1565c0; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; display: inline-block; font-weight: 600; transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
        .footer p { margin: 8px 0; }
        .unsubscribe { margin-top: 15px; }
        .unsubscribe a { color: #667eea; text-decoration: none; }
        .quote-section { background: #fffbea; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f39c12; }
        .quote-section strong { color: #d68910; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Kaar AI!</h1>
          <p>Your journey to staying informed about AI begins now</p>
        </div>

        <div class="welcome-box">
          <h2>Hi ${name}! 👋</h2>
          <p>Thank you for subscribing to the Kaar AI Newsletter. You've made a great choice to stay updated on the latest developments in AI and enterprise technology.</p>
        </div>

        <div class="topic-section">
          <span class="emoji">${topic.emoji}</span>
          <h3>${topic.title}</h3>
          <p>${topic.description}</p>
        </div>

        <div class="benefits">
          <h3>✨ What You'll Get</h3>
          
          <div class="benefit-item">
            <div class="icon">📰</div>
            <div class="text">
              <strong>Top 5 Curated Articles Daily</strong>
              <p>Hand-picked news from across the web, delivered to your inbox every morning.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="icon">⏱️</div>
            <div class="text">
              <strong>5-Minute Read</strong>
              <p>Perfectly formatted for busy professionals. Get all the important news in just 5 minutes.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="icon">✨</div>
            <div class="text">
              <strong>Daily Inspiration</strong>
              <p>Each newsletter includes an inspirational quote to start your day with motivation.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="icon">🎯</div>
            <div class="text">
              <strong>Personalized Content</strong>
              <p>Only see news relevant to your interests. Your preferences shape what you receive.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="icon">🔒</div>
            <div class="text">
              <strong>Privacy First</strong>
              <p>We respect your privacy. Unsubscribe anytime with just one click.</p>
            </div>
          </div>
        </div>

        <div class="schedule-section">
          <h3>📅 Your Daily Schedule</h3>
          <div class="schedule-item">📰 <strong>3:00 AM UTC</strong> - Latest articles fetched from around the web</div>
          <div class="schedule-item">📧 <strong>6:00 AM UTC</strong> - Your personalized newsletter delivered to your inbox</div>
          <p style="color: #5f6368; font-size: 12px; margin: 15px 0 0 0;">Adjust these times based on your timezone. Your first newsletter will arrive tomorrow morning!</p>
        </div>

        <div class="quote-section">
          <strong>💡 Pro Tip:</strong> Save the Kaar AI newsletter email address to your contacts to ensure our emails always reach your inbox and don't get filtered as spam.
        </div>

        <div class="cta-section">
          <p style="color: #5f6368; margin-bottom: 15px;">Check out your subscriber dashboard to manage your preferences:</p>
          <a href="http://localhost:3000" class="cta-button">View Dashboard</a>
        </div>

        <div class="footer">
          <p><strong>Kaar AI Newsletter</strong> - Stay informed about AI and Enterprise Technology</p>
          <p>© 2026 Kaar AI. All rights reserved.</p>
          <div class="unsubscribe">
            <p>You received this email because you subscribed to the Kaar AI Newsletter.</p>
            <p><a href="#unsubscribe">Manage your preferences</a> | <a href="#unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Subscribe a new subscriber
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name, topicPreference } = req.body;

    // Validation
    if (!email || !name || !topicPreference) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['ai-only', 'sap-ai', 'both'].includes(topicPreference)) {
      return res.status(400).json({ error: 'Invalid topic preference' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already exists
    const existing = await dbGet(
      'SELECT id FROM subscribers WHERE email = ?',
      [email]
    );

    if (existing) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Insert subscriber
    const result = await dbRun(
      `INSERT INTO subscribers (email, name, topic_preference, confirmation_token, is_confirmed)
       VALUES (?, ?, ?, ?, ?)`,
      [email, name, topicPreference, confirmationToken, 1]  // Auto-confirm for demo
    );

    // Add to Brevo
    await addContact(email, {
      FIRSTNAME: name,
      TOPIC_PREFERENCE: topicPreference,
      SUBSCRIBED_AT: new Date().toISOString()
    });

    // Send welcome email
    const welcomeEmailHTML = generateWelcomeEmailHTML(name, topicPreference);
    const welcomeResult = await sendEmail(
      email,
      name,
      '🎉 Welcome to Kaar AI Newsletter!',
      welcomeEmailHTML
    );

    if (!welcomeResult.success) {
      console.warn(`Welcome email failed for ${email}, but subscription succeeded:`, welcomeResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed!',
      subscriberId: result.lastID,
      confirmationToken: confirmationToken,
      emailStatus: {
        sent: welcomeResult.success,
        messageId: welcomeResult.messageId,
        message: 'Welcome email has been sent to your inbox!'
      }
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * Get subscriber details
 */
router.get('/:id', async (req, res) => {
  try {
    const subscriber = await dbGet(
      'SELECT id, email, name, topic_preference, subscribed_at, is_active FROM subscribers WHERE id = ?',
      [req.params.id]
    );

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json(subscriber);
  } catch (error) {
    console.error('Error getting subscriber:', error);
    res.status(500).json({ error: 'Failed to get subscriber' });
  }
});

/**
 * Unsubscribe
 */
router.post('/:id/unsubscribe', async (req, res) => {
  try {
    const result = await dbRun(
      `UPDATE subscribers SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * Get subscriber statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await dbGet(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN topic_preference = 'ai-only' THEN 1 ELSE 0 END) as ai_only,
        SUM(CASE WHEN topic_preference = 'sap-ai' THEN 1 ELSE 0 END) as sap_ai,
        SUM(CASE WHEN topic_preference = 'both' THEN 1 ELSE 0 END) as both
      FROM subscribers`
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
