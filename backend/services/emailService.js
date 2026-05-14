const cron = require('node-cron');
const { sendEmail, addContact } = require('./brevoService');
const { dbRun, dbGet, dbAll } = require('../database/db');

/**
 * Generate HTML email template
 */
function generateEmailHTML(subscriberName, aiArticles, sapAiArticles, quote, topicPreference) {
  const articlesHTML = (articles, title) => {
    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1a73e8; font-size: 24px; margin-bottom: 15px; border-bottom: 3px solid #1a73e8; padding-bottom: 10px;">${title}</h2>
        ${articles.map((article, idx) => `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 11px; color: #666;">${idx + 1}. ${article.source} • ${article.date}</p>
            <h3 style="margin: 8px 0; color: #202124; font-size: 16px;">
              <a href="${article.url}" style="color: #1a73e8; text-decoration: none; font-weight: 600;">
                ${article.title}
              </a>
            </h3>
            <p style="margin: 8px 0; color: #5f6368; font-size: 14px; line-height: 1.5;">
              ${article.summary}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  };

  const aiContent = topicPreference !== 'sap-ai' ? articlesHTML(aiArticles, '🤖 Top 5 AI News') : '';
  const sapAiContent = topicPreference !== 'ai-only' ? articlesHTML(sapAiArticles, '💼 Top 5 SAP + AI News') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #1a73e8; font-size: 32px; margin: 0; }
        .header p { color: #5f6368; font-size: 14px; margin: 8px 0 0 0; }
        .date { color: #999; font-size: 12px; margin: 5px 0; }
        .quote-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; margin-top: 30px; text-align: center; }
        .quote-section blockquote { margin: 0; font-style: italic; font-size: 16px; line-height: 1.6; }
        .quote-section .author { margin-top: 10px; font-size: 14px; opacity: 0.9; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
        .unsubscribe { margin-top: 10px; }
        .unsubscribe a { color: #1a73e8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📰 AI & SAP News Daily</h1>
          <p class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Your Daily 5-Minute Read</p>
        </div>

        <p>Hi <strong>${subscriberName}</strong>,</p>
        <p>Here's your curated daily digest of the top news stories. This digest is designed to be a quick 5-minute read to keep you informed about the latest developments in AI and enterprise technology.</p>

        ${aiContent}
        ${sapAiContent}

        <div class="quote-section">
          <blockquote>${quote.split(' - ')[0]}</blockquote>
          <div class="author">— ${quote.split(' - ')[1] || 'Unknown'}</div>
        </div>

        <div class="footer">
          <p>📧 AI & SAP Newsletter | Delivering the latest news daily</p>
          <p style="color: #ccc;">This email was sent to you because you subscribed to our newsletter.</p>
          <div class="unsubscribe">
            <a href="#unsubscribe">Manage preferences</a> | <a href="#unsubscribe">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send newsletters to all active subscribers
 */
async function sendDailyNewsletter() {
  try {
    console.log('📨 Starting daily newsletter send...');
    const today = new Date().toISOString().split('T')[0];

    // Get today's newsletter
    const newsletter = await dbGet(
      'SELECT * FROM newsletters WHERE date = ?',
      [today]
    );

    if (!newsletter) {
      console.warn('⚠️ No newsletter found for today');
      return;
    }

    // Check if already sent today
    if (newsletter.sent_at) {
      console.log('✅ Newsletter already sent today');
      return;
    }

    // Get all active subscribers
    const subscribers = await dbAll(
      'SELECT * FROM subscribers WHERE is_active = 1 AND is_confirmed = 1'
    );

    console.log(`📬 Found ${subscribers.length} active subscribers`);

    const aiArticles = JSON.parse(newsletter.ai_articles);
    const sapAiArticles = JSON.parse(newsletter.sap_ai_articles);
    const quote = newsletter.inspirational_quote;

    let successCount = 0;
    let failureCount = 0;

    // Send to each subscriber
    for (const subscriber of subscribers) {
      try {
        const htmlContent = generateEmailHTML(
          subscriber.name,
          aiArticles,
          sapAiArticles,
          quote,
          subscriber.topic_preference
        );

        const result = await sendEmail(
          subscriber.email,
          subscriber.name,
          `📰 AI & SAP Daily News - ${new Date().toLocaleDateString()}`,
          htmlContent
        );

        if (result.success) {
          // Log successful send
          await dbRun(
            `INSERT INTO email_logs (subscriber_id, newsletter_id, brevo_message_id, status)
             VALUES (?, ?, ?, ?)`,
            [subscriber.id, newsletter.id, result.messageId, 'sent']
          );
          successCount++;
          console.log(`✅ Email sent to ${subscriber.email}`);
        } else {
          // Log failed send
          await dbRun(
            `INSERT INTO email_logs (subscriber_id, newsletter_id, status, error_message)
             VALUES (?, ?, ?, ?)`,
            [subscriber.id, newsletter.id, 'failed', result.error]
          );
          failureCount++;
          console.error(`❌ Failed to send to ${subscriber.email}: ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`❌ Error processing subscriber ${subscriber.email}:`, error.message);
      }

      // Rate limiting - small delay between sends
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark newsletter as sent
    await dbRun(
      'UPDATE newsletters SET sent_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newsletter.id]
    );

    console.log(`📊 Newsletter send complete - Success: ${successCount}, Failed: ${failureCount}`);
    return {
      total: subscribers.length,
      success: successCount,
      failed: failureCount
    };
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
}

/**
 * Start daily newsletter sending task (runs at 10:00 AM IST / 4:30 AM UTC)
 */
function startDailyEmailTask() {
  // Run at 4:30 AM UTC (10:00 AM IST) every day
  cron.schedule('30 4 * * *', async () => {
    console.log('⏰ Scheduled task triggered: Daily newsletter send');
    await sendDailyNewsletter();
  });
}

module.exports = {
  generateEmailHTML,
  sendDailyNewsletter,
  startDailyEmailTask
};
