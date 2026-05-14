const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

/**
 * Send email via Brevo API
 */
async function sendEmail(recipientEmail, recipientName, subject, htmlContent) {
  try {
    console.log(`📧 Preparing to send email to: ${recipientEmail}`);
    
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@newsletter.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'AI & SAP Newsletter';
    
    const payload = {
      sender: {
        email: senderEmail,
        name: senderName
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName
        }
      ],
      subject: subject,
      htmlContent: htmlContent,
      replyTo: {
        email: senderEmail,
        name: senderName
      }
    };

    console.log(`🔧 Brevo API Call Details:`);
    console.log(`   URL: ${BREVO_API_URL}/smtp/email`);
    console.log(`   From: ${senderEmail} (${senderName})`);
    console.log(`   To: ${recipientEmail} (${recipientName})`);
    console.log(`   Subject: ${subject}`);
    console.log(`   API Key Present: ${BREVO_API_KEY ? 'YES' : 'NO'}`);

    const response = await axios.post(`${BREVO_API_URL}/smtp/email`, payload, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    console.log(`✅ Email sent successfully! Message ID: ${response.data.messageId}`);

    return {
      success: true,
      messageId: response.data.messageId,
      status: 'sent'
    };
  } catch (error) {
    console.error('❌ Error sending email via Brevo:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Error: ${error.response?.data?.message || error.message}`);
    console.error(`   Full Response:`, error.response?.data);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: 'failed',
      details: error.response?.data
    };
  }
}

/**
 * Create a contact in Brevo
 */
async function addContact(email, attributes = {}) {
  try {
    const payload = {
      email: email,
      attributes: attributes
    };

    const response = await axios.post(`${BREVO_API_URL}/contacts`, payload, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    return {
      success: true,
      contactId: response.data.id
    };
  } catch (error) {
    // Contact might already exist, which is okay
    if (error.response?.status === 400 && error.response?.data?.code === 'DUPLICATE_PARAMETER') {
      return { success: true, message: 'Contact already exists' };
    }
    console.error('Error adding contact to Brevo:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Update contact in Brevo
 */
async function updateContact(email, attributes = {}) {
  try {
    const payload = {
      attributes: attributes
    };

    await axios.put(`${BREVO_API_URL}/contacts/${email}`, payload, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating contact in Brevo:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Get contact from Brevo
 */
async function getContact(email) {
  try {
    const response = await axios.get(`${BREVO_API_URL}/contacts/${email}`, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    return {
      success: true,
      contact: response.data
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, message: 'Contact not found' };
    }
    console.error('Error getting contact from Brevo:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Delete contact from Brevo
 */
async function deleteContact(email) {
  try {
    await axios.delete(`${BREVO_API_URL}/contacts/${email}`, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting contact from Brevo:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

module.exports = {
  sendEmail,
  addContact,
  updateContact,
  getContact,
  deleteContact
};
