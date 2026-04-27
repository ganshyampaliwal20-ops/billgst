require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyAdQIyVEaE-213JTx26o0nCx4guKD8iICM');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro', generationConfig: { responseMimeType: 'application/json' } });
model.generateContent('Return exactly { "amount": "1", "date": "2024-01-01", "material": "Test" } as JSON.')
    .then(res => console.log('SUCCESS:', res.response.text()))
    .catch(err => console.error('ERROR:', err.message));
