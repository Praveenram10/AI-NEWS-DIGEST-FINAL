const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../database/db');

/**
 * Get latest newsletters
 */
router.get('/newsletters', async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const newsletters = await dbAll(
      'SELECT * FROM newsletters ORDER BY date DESC LIMIT ?',
      [limit]
    );

    const parsed = newsletters.map(n => ({
      ...n,
      ai_articles: JSON.parse(n.ai_articles),
      sap_ai_articles: JSON.parse(n.sap_ai_articles)
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error getting newsletters:', error);
    res.status(500).json({ error: 'Failed to get newsletters' });
  }
});

/**
 * Get newsletter by date
 */
router.get('/newsletters/:date', async (req, res) => {
  try {
    const newsletter = await dbGet(
      'SELECT * FROM newsletters WHERE date = ?',
      [req.params.date]
    );

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
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

module.exports = router;
