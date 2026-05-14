const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Fetch AI news articles using Gemini API
 */
async function fetchAINews() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a tech news curator. Search the web and provide the top 5 most recent and important AI news articles from today or this week.

For each article, provide in this exact JSON format:
{
  "articles": [
    {
      "title": "Article Title",
      "url": "https://source.com/article",
      "summary": "2-3 sentence summary (max 100 words)",
      "source": "Source Name",
      "date": "2024-05-12"
    }
  ]
}

Focus on:
- Latest AI breakthroughs
- New AI products/services
- AI policy and regulations
- AI research findings
- Enterprise AI adoption

Ensure each article is recent (within last 7 days) and from credible sources.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return data.articles || getSampleAINews();
  } catch (error) {
    console.error('Error fetching AI news from Gemini:', error.message);
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
 * Fetch SAP+AI news articles using Gemini API
 */
async function fetchSAPAINews() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a tech news curator specializing in enterprise software. Search the web and provide the top 5 most recent SAP AI and enterprise AI news articles from today or this week.

For each article, provide in this exact JSON format:
{
  "articles": [
    {
      "title": "Article Title",
      "url": "https://source.com/article",
      "summary": "2-3 sentence summary (max 100 words)",
      "source": "Source Name",
      "date": "2024-05-12"
    }
  ]
}

Focus on:
- SAP AI news and updates
- SAP S/4HANA AI capabilities
- Enterprise AI adoption (SAP related)
- Business process automation with AI
- Cloud and AI in enterprise

Ensure each article is recent (within last 7 days) and from credible sources.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return data.articles || getSampleSAPAINews();
  } catch (error) {
    console.error('Error fetching SAP+AI news from Gemini:', error.message);
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
 * Generate inspirational quote using Gemini API
 */
async function generateInspirationQuote() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate a single inspiring and motivational quote about technology, innovation, or the future of AI. 
    
Keep it concise (under 150 characters) and impactful.
Format: "Quote text" - Author Name

Make it unique and not overused.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating quote from Gemini:', error.message);
    // Return a sample quote if API fails
    const quotes = [
      '"The future is created by those who believe in the beauty of their dreams." - Eleanor Roosevelt',
      '"Technology is best when it brings people together." - Matt Mullenweg',
      '"Intelligence is the ability to adapt to change." - Stephen Hawking',
      '"The only way to predict the future is to invent it." - Alan Kay',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Artificial intelligence will be as revolutionary as electricity." - Andrew Ng',
      '"The human brain is a pattern-recognition machine." - Yann LeCun'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}

module.exports = {
  fetchAINews,
  fetchSAPAINews,
  generateInspirationQuote
};
