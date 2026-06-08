const Chat = require('../models/chat');
const BaseRepository = require('./baseRepository');

class ChatRepository extends BaseRepository {
    constructor() {
        super(Chat);
    }

    async getChatHistory(roomId) {
        try {
            const chats = await Chat.find({roomId}).sort({ createdAt: 1 }).populate('senderId', 'username avatar').populate('receiverId', 'username avatar');
            return chats;
        } catch (error) {
            throw new Error('Error fetching chat history');
        }
    }

    async markMessagesAsRead(roomId, userId) {
        try {
            const result = await Chat.updateMany ({
                roomId,
                receiverId: userId,
                isRead: false
            }, {
                $set: { isRead: true }
            })
            return result;
        }catch (error) {
            throw new Error('Error marking messages as read');
        }
    }
}

module.exports = ChatRepository;
