// sockets/chatHandler.js
const { streamCVConversation } = require('../services/ollamaService');
const resumeService = require('../services/resumeService');

module.exports = function registerChatHandlers(io, socket) {

    socket.on('join_session', async ({ resumeId, userId }) => {
        socket.join(`resume_${resumeId}`);
        socket.resumeId = resumeId;
        socket.userId = userId;
        console.log(`[Socket] User ${userId} joined resume session: ${resumeId}`);
    });

    socket.on('user_message', async (data) => {
        const { message, history } = data;
        const resumeId = socket.resumeId;
        const userId = socket.userId;

        if (!resumeId || !userId) {
            return socket.emit('error', { message: 'Unauthorized or invalid session.' });
        }

        let fullResponseBuffer = '';

        try {
            // Build conversation payload for Qwen
            const messages = [
                ...history.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text })),
                { role: 'user', content: message }
            ];

            // Stream tokens to frontend
            await streamCVConversation(messages, (token) => {
                fullResponseBuffer += token;

                // Emit streaming token to client UI
                socket.emit('ai_token', { token });
            });

            // Stream completed signal
            socket.emit('ai_stream_end');

            // Process and extract structured JSON payload from buffer
            await processAndApplyUpdates(fullResponseBuffer, resumeId, userId, io);

        } catch (err) {
            console.error('[Socket Chat Error]:', err);
            socket.emit('ai_error', { message: 'Failed to generate response from Qwen local engine.' });
        }
    });
};

/**
 * Parses Markdown JSON block from a streaming buffer and syncs MongoDB and Live Preview
 */
async function processAndApplyUpdates(buffer, resumeId, userId, io) {
    const jsonMatch = buffer.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) return;

    try {
        const parsedData = JSON.parse(jsonMatch[1]);

        // Update MongoDB
        if (parsedData.basics) {
            await resumeService.updateResumeSection(resumeId, userId, 'basics', parsedData.basics);
        }
        if (parsedData.work && parsedData.work.length > 0) {
            await resumeService.updateResumeSection(resumeId, userId, 'work', parsedData.work);
        }
        if (parsedData.skills && parsedData.skills.length > 0) {
            await resumeService.updateResumeSection(resumeId, userId, 'skills', parsedData.skills);
        }

        // Broadcast updated CV data to frontend Live Preview
        io.to(`resume_${resumeId}`).emit('cv_updated', {
            resumeId,
            cvData: parsedData
        });

    } catch (err) {
        console.warn('[JSON Parsing Warning] Non-critical: Failed to parse structural JSON block from AI output.');
    }
}