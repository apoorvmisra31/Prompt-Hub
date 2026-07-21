const { GoogleGenAI } = require("@google/genai")
const ai = new GoogleGenAI({})
console.log(process.env.GEMINI_API_KEY);
async function generateResponse(content) {

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: {
            temperature: 0.2,
            systemInstruction: `You are a 
            helpful AI Assistant.`
        }

    })
    return response.text
}
async function generateVector(content) {

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768
        }
    })
    return response.embeddings[0].values
}

async function generateResponse(content) {
    console.log("1. Enter generateResponse");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config: {
            temperature: 0.2,
            systemInstruction: "You are a helpful AI Assistant."
        }
    });

    console.log("2. Gemini returned");

    console.log(response);

    return response.text;
}
module.exports = {
    generateResponse,
    generateVector
}