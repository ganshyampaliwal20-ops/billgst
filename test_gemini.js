const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI('AIzaSyAwt--rBUxWreh4hv33fMYiBg5aVB6oJx4');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent("Say hi");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
