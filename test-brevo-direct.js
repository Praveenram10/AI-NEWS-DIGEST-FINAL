#!/usr/bin/env node

/**
 * Direct Brevo API Test
 * Run this to test Brevo connectivity without going through the app
 */

const axios = require('axios');
require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

console.log('\n=====================================');
console.log('🧪 BREVO API DIRECT TEST');
console.log('=====================================\n');

// Configuration check
console.log('📋 Configuration Check:');
console.log(`   API Key Present: ${BREVO_API_KEY ? '✅ YES' : '❌ NO'}`);
console.log(`   API Key Length: ${BREVO_API_KEY ? BREVO_API_KEY.length : 0} chars`);
console.log(`   Sender Email: ${process.env.BREVO_SENDER_EMAIL || 'noreply@newsletter.com'}`);
console.log(`   Sender Name: ${process.env.BREVO_SENDER_NAME || 'AI & SAP Newsletter'}\n`);

if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY not found in .env file!');
    process.exit(1);
}

// Test recipient email
const testEmail = process.argv[2] || 'test@example.com';

console.log(`📧 Test Email: ${testEmail}\n`);

// Direct API test
async function testBrevoAPI() {
    try {
        console.log('🔄 Sending test email via Brevo API...\n');

        const payload = {
            sender: {
                email: process.env.BREVO_SENDER_EMAIL || 'noreply@newsletter.com',
                name: process.env.BREVO_SENDER_NAME || 'AI & SAP Newsletter'
            },
            to: [
                {
                    email: testEmail,
                    name: 'Test User'
                }
            ],
            subject: '🧪 Direct Brevo API Test',
            htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 20px auto; background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; color: #667eea; }
                        .success { background: #e8f5e9; color: #2e7d32; padding: 20px; border-radius: 6px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Brevo API Test Success!</h1>
                        </div>
                        <div class="success">
                            <strong>✅ Your Brevo API is working correctly!</strong>
                        </div>
                        <p>
                            This test email was sent directly via Brevo API.
                            If you received this email, your Brevo integration is fully functional.
                        </p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                            Test Time: ${new Date().toISOString()}
                        </p>
                    </div>
                </body>
                </html>
            `
        };

        console.log('📤 API Call Details:');
        console.log(`   URL: ${BREVO_API_URL}/smtp/email`);
        console.log(`   Method: POST`);
        console.log(`   From: ${payload.sender.email}`);
        console.log(`   To: ${testEmail}\n`);

        const response = await axios.post(`${BREVO_API_URL}/smtp/email`, payload, {
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ SUCCESS!\n');
        console.log('📊 Response Details:');
        console.log(`   Status Code: ${response.status}`);
        console.log(`   Message ID: ${response.data.messageId}`);
        console.log(`   Timestamp: ${new Date().toISOString()}\n`);

        console.log('🎉 Next Steps:');
        console.log(`   1. Check your inbox (${testEmail}) for the test email`);
        console.log('   2. Email should arrive in < 2 seconds');
        console.log('   3. If received: Your Brevo integration is WORKING! ✅');
        console.log('   4. If not received: Check spam folder or sender verification\n');

        console.log('=====================================');
        console.log('✅ BREVO API TEST PASSED');
        console.log('=====================================\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ FAILED!\n');
        console.log('📊 Error Details:');
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error Code: ${error.response?.data?.code}`);
        console.log(`   Message: ${error.response?.data?.message}`);
        console.log(`   Full Error:\n${JSON.stringify(error.response?.data, null, 2)}\n`);

        console.log('🔧 Troubleshooting:');
        
        if (error.response?.status === 401) {
            console.log('   ❌ INVALID API KEY');
            console.log('   → Check your BREVO_API_KEY in .env');
            console.log('   → Key should start with: xkeysib-');
            console.log('   → Generate new key at: https://app.brevo.com/settings/api\n');
        } else if (error.response?.status === 400 && error.response?.data?.code === 'INVALID_REQUEST') {
            console.log('   ❌ SENDER EMAIL NOT VERIFIED');
            console.log('   → Log in to: https://app.brevo.com/settings/account/senders');
            console.log('   → Find your sender email and verify it');
            console.log('   → It must have a GREEN CHECKMARK\n');
        } else if (error.response?.status === 429) {
            console.log('   ❌ QUOTA EXCEEDED');
            console.log('   → You\'ve exceeded Brevo free tier limits');
            console.log('   → Upgrade your account or wait for reset\n');
        } else {
            console.log(`   → Check error message above for details\n`);
        }

        console.log('=====================================');
        console.log('❌ BREVO API TEST FAILED');
        console.log('=====================================\n');

        process.exit(1);
    }
}

// Run test
testBrevoAPI();
