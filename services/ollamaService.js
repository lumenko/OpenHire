// services/ollamaService.js
const { Ollama } = require('ollama');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

const ollama = new Ollama({ host: OLLAMA_HOST });

const SYSTEM_PROMPT = `
You are OpenHire AI, an expert career strategist and CV builder.
Your task is to interview the job candidate step-by-step and craft a professional CV.

RULES:
1. Conduct a natural, step-by-step interview (e.g. Contact Info -> Work History -> Education -> Skills -> Projects).
2. Keep your conversational replies concise, actionable, and encouraging.
3. ALWAYS append a structured JSON block at the VERY END of your response, wrapped inside a \`\`\`json code fence.
4. The JSON block must mirror changes to the CV.

JSON Schema format:
{
  "basics": { "name": "", "label": "", "email": "", "phone": "", "summary": "" },
  "work": [{ "company": "", "position": "", "startDate": "", "endDate": "", "summary": "", "highlights": [] }],
  "skills": [{ "name": "", "level": "" }]
}
`;

/**
 * Stream response tokens from Qwen 2.5
 */
async function streamCVConversation(messages, onChunk) {
    const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
    ];

    try {
        const responseStream = await ollama.chat({
            model: MODEL_NAME,
            messages: formattedMessages,
            stream: true,
            options: {
                temperature: 0.7,
                num_ctx: 4096 // Keep context compact for low RAM usage
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.message && chunk.message.content) {
                onChunk(chunk.message.content);
            }
        }
    } catch (error) {
        console.error('[Ollama Error]:', error.message);
        throw error;
    }
}

module.exports = { streamCVConversation };