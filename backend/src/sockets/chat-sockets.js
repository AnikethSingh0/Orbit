const ChatService = require('../services/chat-service');
const chatService = new ChatService();
const generateRoomId = require('../helper/generateRoomId');

const chatSocketHandler = (io) => {
    io.on('connection', (scocket) => {
        console.log('New client connected:', scocket.id);

        scocket.on('joinRoom', async ({ senderId, receiverId }) => {
            const roomId = generateRoomId(senderId, receiverId);
            scocket.join(roomId);
            console.log(`Client ${scocket.id} joined room: ${roomId}`);
        });

        scocket.on('joinNotificationRoom', ({ userId }) => {
            if (userId) {
                scocket.join(userId.toString());
                console.log(`Client ${scocket.id} joined notification room: ${userId}`);
            }
        });

        
        scocket.on('chatMessage', async ({ roomId, senderId, receiverId, message, mediaUrl }) => {
            try {
                const roomid = generateRoomId(senderId, receiverId);
                const savedChat = await chatService.addChat(roomid, senderId, receiverId, message, mediaUrl);
                io.to(roomid).emit('newChatMessage', savedChat);
            } catch (error) {
                console.error('Error adding chat message:', error);
            }
        });

        scocket.on('markAsRead', async ({ roomId, userId }) => {
            try {
                await chatService.markMessagesAsRead(roomId, userId);
                io.to(roomId).emit('messagesMarkedAsRead', { roomId, userId });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        scocket.on('disconnect', () => {
            console.log('Client disconnected:', scocket.id);
        });
    });
}

module.exports = chatSocketHandler;