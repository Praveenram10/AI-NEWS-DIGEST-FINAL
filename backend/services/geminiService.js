const axios = require('axios');

// NewsAPI key - using free tier (100 requests/day)
const NEWS_API_KEY = 'c9c22b5a06fb4f0a87b8d4f6e8c0b1a2';
const NEWS_API_URL = 'https://newsapi.org/v2';

/**
 * Fetch AI news articles using NewsAPI
 */
async function fetchAINews() {
  try {
    console.log('🤖 Fetching AI news from NewsAPI...');
    
    const response = await axios.get(`${NEWS_API_URL}/everything`, {
      params: {
        q: 'artificial intelligence OR AI breakthrough OR machine learning',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
        apiKey: NEWS_API_KEY
      },
      timeout: 10000
    });

    if (response.data.articles && response.data.articles.length > 0) {
      const articles = response.data.articles.map(article => ({
        title: article.title,
        url: article.url,
        summary: article.description || article.content || 'Read more for details',
        source: article.source.name,
        date: new Date(article.publishedAt).toISOString().split('T')[0]
      }));
      console.log(`✅ Got ${articles.length} AI articles from NewsAPI`);
      return articles;
    }
    
    return getSampleAINews();
  } catch (error) {
    console.error('Error fetching AI news from NewsAPI:', error.message);
    // Return sample data if API fails
    return getSampleAINews();
  }
}

/**
 * Get sample AI news for fallback
 */
function getSampleAINews() {
  return [
    {
      "title": "OpenAI Releases GPT-4 Turbo with 128K Context Window",
      "url": "https://openai.com/blog/gpt-4-turbo",
      "summary": "OpenAI announced the release of GPT-4 Turbo, featuring an extended 128K context window and improved reasoning capabilities.",
      "source": "OpenAI Blog",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Google Advances AI Safety with New Benchmark",
      "url": "https://google.com/ai",
      "summary": "Google unveiled a comprehensive AI safety benchmark to evaluate model robustness and reliability.",
      "source": "Google DeepMind",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Meta Releases Llama 2 Open Source Model",
      "url": "https://meta.com/llama",
      "summary": "Meta released Llama 2, an open-source large language model, available for research and commercial use.",
      "source": "Meta Blog",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Microsoft Integrates GPT-4 into Office Suite",
      "url": "https://microsoft.com/copilot",
      "summary": "Microsoft integrated advanced AI capabilities into Office 365, enabling AI-powered productivity features.",
      "source": "Microsoft News",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "DeepMind's AlphaZero Masters Multiple Games",
      "url": "https://deepmind.com",
      "summary": "DeepMind demonstrated AlphaZero's ability to master complex games through self-play and deep learning.",
      "source": "DeepMind",
      "date": new Date().toISOString().split('T')[0]
    }
  ];
}

/**
 * Fetch SAP+AI news articles using NewsAPI
 */
async function fetchSAPAINews() {
  try {
    console.log('💼 Fetching SAP+AI news from NewsAPI...');
    
    const response = await axios.get(`${NEWS_API_URL}/everything`, {
      params: {
        q: 'SAP OR enterprise AI OR business automation OR ERP AI',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 5,
        apiKey: NEWS_API_KEY
      },
      timeout: 10000
    });

    if (response.data.articles && response.data.articles.length > 0) {
      const articles = response.data.articles.map(article => ({
        title: article.title,
        url: article.url,
        summary: article.description || article.content || 'Read more for details',
        source: article.source.name,
        date: new Date(article.publishedAt).toISOString().split('T')[0]
      }));
      console.log(`✅ Got ${articles.length} SAP+AI articles from NewsAPI`);
      return articles;
    }
    
    return getSampleSAPAINews();
  } catch (error) {
    console.error('Error fetching SAP+AI news from NewsAPI:', error.message);
    // Return sample data if API fails
    return getSampleSAPAINews();
  }
}

/**
 * Get sample SAP+AI news for fallback
 */
function getSampleSAPAINews() {
  return [
    {
      "title": "SAP Launches AI Co-Pilot for S/4HANA",
      "url": "https://sap.com/news",
      "summary": "SAP announced the launch of AI Co-Pilot, an intelligent assistant for SAP S/4HANA that helps with business processes.",
      "source": "SAP News",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Enterprise AI Adoption Reaches 55% in 2024",
      "url": "https://gartner.com/reports",
      "summary": "Gartner's latest report shows enterprise AI adoption has grown to 55%, with ERP systems at the core.",
      "source": "Gartner",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "SAP Analytics Cloud Enhances AI Capabilities",
      "url": "https://sap.com/analytics",
      "summary": "SAP Analytics Cloud now features advanced AI-driven insights and predictive analytics for better business decisions.",
      "source": "SAP",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Accenture Reports AI Transforming Supply Chains",
      "url": "https://accenture.com/insights",
      "summary": "Accenture's research shows AI is revolutionizing supply chain management and optimization in enterprises.",
      "source": "Accenture",
      "date": new Date().toISOString().split('T')[0]
    },
    {
      "title": "Microsoft Dynamics 365 Gets AI Enhancements",
      "url": "https://microsoft.com/business",
      "summary": "Microsoft introduced new AI capabilities in Dynamics 365 for improved customer engagement and operations.",
      "source": "Microsoft",
      "date": new Date().toISOString().split('T')[0]
    }
  ];
}

/**
 * Generate inspirational quote - uses local quotes for reliability
 */
async function generateInspirationQuote() {
  try {
    const quotes = [
      '"The future is created by those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"Technology is best when it brings people together." - Matt Mullenweg',
      '"Intelligence is the ability to adapt to change." - Stephen Hawking',
      '"The only way to predict the future is to invent it." - Alan Kay',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Artificial intelligence will be as revolutionary as electricity." - Andrew Ng',
      '"The human brain is a pattern-recognition machine." - Yann LeCun',
      '"The best way to predict the future is to invent it." - Peter Drucker',
      '"Technology is not just about the product, it\'s about how it makes you feel." - Jony Ive',
      '"Progress is impossible without change." - George Bernard Shaw',
      '"The greatest glory in living lies not in never falling, but in rising every time we fall." - Nelson Mandela',
      '"Creativity is intelligence having fun." - Albert Einstein',
      '"The mind is everything. What you think, you become." - Buddha'
    ];
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    console.log(`✨ Generated daily quote: ${quote}`);
    return quote;
  } catch (error) {
    console.error('Error generating quote:', error.message);
    // Return a default quote if something goes wrong
    return '"The only constant in life is change." - Heraclitus';
  }
}

module.exports = {
  fetchAINews,
  fetchSAPAINews,
  generateInspirationQuote
};
