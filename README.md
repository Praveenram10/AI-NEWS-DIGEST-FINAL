# AI & SAP News Newsletter

A bold and modern web application that delivers curated daily news about AI and SAP+AI to subscribers' inboxes. Features a subscriber registration portal, automated daily newsletter delivery, and a secure admin panel.

## 🎯 Features

### Subscriber Portal
- **Beautiful Registration Form**: Modern, responsive UI with smooth animations
- **Topic Selection**: Choose between AI-only, SAP+AI, or both topics
- **Email Confirmation**: Success popup on subscription
- **Auto-Confirmation**: Subscribers automatically added to mailing list

### Daily Newsletter
- **Top 5 AI Articles**: Latest AI breakthroughs, products, policies, research, and adoption
- **Top 5 SAP+AI Articles**: Enterprise AI, SAP solutions, business automation
- **5-Minute Read**: Optimized content length for busy professionals
- **Inspirational Quote**: Daily motivational message
- **Fresh Content Daily**: Automatic fetching at 3 AM, delivery at 6 AM

### Admin Panel
- **Secure Login**: Pre-set admin credentials (admin/admin123)
- **Dashboard Overview**: Key metrics and statistics
- **Subscriber Management**: View, manage, and remove subscribers
- **Topic Preferences**: See breakdown of subscriber interests
- **Delivery Statistics**: Track newsletter delivery success/failure rates
- **Newsletter Editor**: View and manage today's newsletter content

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Integration**: Google Gemini API (for news fetching and inspiration)
- **Email Service**: Brevo API (for automated email delivery)
- **Scheduling**: node-cron (for daily automated tasks)

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm
- Gemini API Key (provided)
- Brevo API Key (provided)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```

3. **Create .env File** (Already created with API keys)
   ```
   GEMINI_API_KEY=your_gemini_key
   BREVO_API_KEY=your_brevo_key
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - **Subscriber Portal**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin
   - **API Health**: http://localhost:3000/api/health

## 📚 Project Structure

```
├── backend/
│   ├── database/
│   │   ├── init.js           # Database initialization
│   │   ├── db.js             # Database connection & helpers
│   │   └── newsletter.db     # SQLite database (created on init)
│   ├── services/
│   │   ├── geminiService.js  # Gemini API integration
│   │   ├── brevoService.js   # Brevo email API integration
│   │   ├── newsService.js    # Daily news fetching service
│   │   └── emailService.js   # Newsletter email generation & sending
│   ├── routes/
│   │   ├── subscribers.js    # Subscriber registration & management
│   │   ├── admin.js          # Admin panel endpoints
│   │   └── news.js           # Newsletter content endpoints
│   └── server.js             # Express server setup
├── frontend/
│   └── index.html            # Subscriber registration portal
├── admin/
│   └── index.html            # Admin panel dashboard
├── .env                       # Environment configuration (with API keys)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🔄 How It Works

### Daily Workflow

1. **3:00 AM - News Fetching**
   - `newsService.js` triggers automatically
   - Queries Gemini API for top AI news articles
   - Queries Gemini API for top SAP+AI news articles
   - Generates inspirational quote
   - Stores everything in SQLite database

2. **6:00 AM - Email Delivery**
   - `emailService.js` triggers automatically
   - Retrieves newsletter content from database
   - Sends personalized emails via Brevo API
   - Filters content based on subscriber topic preferences
   - Logs delivery status and errors

### APIs Used

#### Gemini API (Google)
- **Purpose**: AI-powered news research and inspiration
- **Usage**: 
  - Fetch latest AI articles
  - Fetch latest SAP+AI articles
  - Generate inspirational quotes
- **Endpoint**: Google's generative AI SDK

#### Brevo API (Sendinblue)
- **Purpose**: Transactional email delivery
- **Usage**:
  - Send newsletter emails
  - Manage subscriber contacts
  - Track delivery metrics
- **Endpoint**: `https://api.brevo.com/v3`

## 📝 API Endpoints

### Subscriber Endpoints
- `POST /api/subscribers/subscribe` - Register new subscriber
- `GET /api/subscribers/:id` - Get subscriber details
- `POST /api/subscribers/:id/unsubscribe` - Unsubscribe
- `GET /api/subscribers/stats/summary` - Get subscription statistics

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/subscribers` - List all subscribers (paginated)
- `DELETE /api/admin/subscribers/:id` - Delete subscriber
- `GET /api/admin/delivery-stats` - Get delivery statistics
- `GET /api/admin/newsletter/today` - Get today's newsletter
- `PUT /api/admin/newsletter/today` - Update today's newsletter

### News Endpoints
- `GET /api/news/newsletters` - Get latest newsletters
- `GET /api/news/newsletters/:date` - Get newsletter by date

## 🔐 Security

- Admin panel protected with simple auth (upgrade to JWT in production)
- Subscriber emails stored in SQLite and Brevo
- API keys stored in environment variables
- CORS enabled for frontend-backend communication

## 📊 Database Schema

### Subscribers Table
- `id`: Unique identifier
- `email`: Subscriber email
- `name`: Subscriber name
- `topic_preference`: AI-only, SAP-AI, or both
- `subscribed_at`: Subscription timestamp
- `is_active`: Active status
- `is_confirmed`: Email confirmation status

### Newsletters Table
- `id`: Unique identifier
- `date`: Newsletter date (unique per day)
- `ai_articles`: JSON array of AI articles
- `sap_ai_articles`: JSON array of SAP+AI articles
- `inspirational_quote`: Daily quote
- `created_at`: Creation timestamp
- `sent_at`: Send completion timestamp

### Email Logs Table
- `id`: Unique identifier
- `subscriber_id`: Foreign key to subscribers
- `newsletter_id`: Foreign key to newsletters
- `sent_at`: Send timestamp
- `brevo_message_id`: Brevo's message tracking ID
- `status`: sent/failed/bounced
- `error_message`: Error details if failed

## 🚀 Deployment

### Production Considerations
1. Use environment variables for all sensitive data
2. Implement JWT authentication for admin panel
3. Add email verification for subscriptions
4. Implement rate limiting on API endpoints
5. Add error monitoring (Sentry, etc.)
6. Use production Brevo credentials
7. Implement database backups
8. Add comprehensive logging
9. Set up monitoring for scheduled tasks

### Scaling
- Move to PostgreSQL for larger subscriber bases
- Implement Redis caching for performance
- Use Kubernetes for deployment
- Add load balancing for API endpoints

## 📄 License

MIT

## 🤝 Support

For issues or questions, please check the console logs and error messages.

## 🎉 Getting Started

1. Install dependencies: `npm install`
2. Initialize database: `npm run init-db`
3. Start server: `npm start`
4. Visit http://localhost:3000 to register
5. Visit http://localhost:3000/admin to access admin panel
6. Login with: **admin** / **admin123**

---

**Built with ❤️ for AI & SAP professionals**
