const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'newsletter.db');

// Create database if it doesn't exist
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('📦 Connected to SQLite database');
});

// Initialize tables
db.serialize(() => {
  // Subscribers table
  db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      topic_preference TEXT NOT NULL CHECK(topic_preference IN ('ai-only', 'sap-ai', 'both')),
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at DATETIME,
      is_active INTEGER DEFAULT 1,
      confirmation_token TEXT,
      is_confirmed INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) console.error('Error creating subscribers table:', err);
    else console.log('✅ Subscribers table ready');
  });

  // Newsletters table
  db.run(`
    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE NOT NULL,
      ai_articles TEXT NOT NULL,
      sap_ai_articles TEXT NOT NULL,
      inspirational_quote TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME
    )
  `, (err) => {
    if (err) console.error('Error creating newsletters table:', err);
    else console.log('✅ Newsletters table ready');
  });

  // Email delivery logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriber_id INTEGER NOT NULL,
      newsletter_id INTEGER NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      brevo_message_id TEXT,
      status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed', 'bounced')),
      error_message TEXT,
      FOREIGN KEY(subscriber_id) REFERENCES subscribers(id),
      FOREIGN KEY(newsletter_id) REFERENCES newsletters(id)
    )
  `, (err) => {
    if (err) console.error('Error creating email_logs table:', err);
    else console.log('✅ Email logs table ready');
  });

  // Admin logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating admin_logs table:', err);
    else console.log('✅ Admin logs table ready');
  });

  // News cache table
  db.run(`
    CREATE TABLE IF NOT EXISTS news_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      article_title TEXT NOT NULL,
      article_url TEXT NOT NULL,
      article_summary TEXT NOT NULL,
      article_date DATETIME NOT NULL,
      source TEXT,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_used_in_newsletter INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) console.error('Error creating news_cache table:', err);
    else console.log('✅ News cache table ready');
  });

  // Indexes for performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)`, (err) => {
    if (err) console.error('Error creating index:', err);
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_newsletters_date ON newsletters(date)`, (err) => {
    if (err) console.error('Error creating index:', err);
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber ON email_logs(subscriber_id)`, (err) => {
    if (err) console.error('Error creating index:', err);
  });

  console.log('✨ Database initialization complete!');
});

db.close(() => {
  console.log('🔓 Database connection closed');
});
