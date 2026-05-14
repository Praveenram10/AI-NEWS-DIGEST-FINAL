const cron = require('node-cron');
const { fetchAINews, fetchSAPAINews } = require('./geminiService');
const { dbRun, dbGet, dbAll } = require('../database/db');

/**
 * Fetch and cache daily news
 */
async function fetchAndCacheNews() {
  try {
    console.log('📰 Starting daily news fetch...');
    const today = new Date().toISOString().split('T')[0];

    // Check if news already fetched for today
    const existingNews = await dbGet(
      'SELECT id FROM newsletters WHERE date = ?',
      [today]
    );

    if (existingNews) {
      console.log('✅ News already fetched for today');
      return;
    }

    // Fetch AI news
    console.log('🤖 Fetching AI news...');
    const aiArticles = await fetchAINews();
    
    // Fetch SAP+AI news
    console.log('💼 Fetching SAP+AI news...');
    const sapAiArticles = await fetchSAPAINews();

    if (aiArticles.length === 0 || sapAiArticles.length === 0) {
      console.warn('⚠️ Could not fetch sufficient news articles');
      return;
    }

    // Store in database
    const aiJson = JSON.stringify(aiArticles);
    const sapAiJson = JSON.stringify(sapAiArticles);
    const quote = '"The only way to predict the future is to create it." - Peter Drucker';

    await dbRun(
      `INSERT INTO newsletters (date, ai_articles, sap_ai_articles, inspirational_quote)
       VALUES (?, ?, ?, ?)`,
      [today, aiJson, sapAiJson, quote]
    );

    console.log('✅ News fetched and cached successfully');
    return {
      date: today,
      aiArticlesCount: aiArticles.length,
      sapAiArticlesCount: sapAiArticles.length
    };
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

/**
 * Start daily news fetching task (runs at 8:00 AM IST / 2:30 AM UTC)
 */
function startDailyNewsTask() {
  // Run at 2:30 AM UTC (8:00 AM IST) every day
  cron.schedule('30 2 * * *', async () => {
    console.log('⏰ Scheduled task triggered: Daily news fetch');
    await fetchAndCacheNews();
  });

  // Also run on startup with small delay
  setTimeout(() => {
    console.log('🚀 Running initial news fetch...');
    fetchAndCacheNews();
  }, 5000);
}

module.exports = {
  fetchAndCacheNews,
  startDailyNewsTask
};
