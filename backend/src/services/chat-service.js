const ChatRepository = require('../repository/chatRepository.js');
const BaseService = require('./base-service');
class ChatService extends BaseService {
    constructor() {
        const chatRepository = new ChatRepository();
        super(chatRepository);
        this.chatRepository = chatRepository;
    }

    async getChatHistory(roomId) {
        try{
            const chats = await this.chatRepository.getChatHistory(roomId);
            return chats;
        }catch(error) {
            console.log("Error in ChatService while fetching chat history:", error);
            throw error;
        }
    }

    async markMessagesAsRead(roomId, userId) {
        try{
            const result = await this.chatRepository.markMessagesAsRead(roomId, userId);
            return result;
        }catch(error) {
            console.log("Error in ChatService while marking messages as read:", error);
            throw error;
        }
    }
    async addChat(roomId, senderId, receiverId, message,mediaUrl = null) {
        try{
            const chatData = {
                roomId,
                senderId,
                receiverId,
                message,
                isRead: false,
                mediaUrl
            };
            const chat = await this.chatRepository.create(chatData);
            return chat;
        }catch(error) {
            console.log("Error in ChatService while adding chat message:", error);
            throw error;
        }
    }
}
module.exports = ChatService;