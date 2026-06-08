const ChatService = require('../services/chat-service');
const chatService = new ChatService();

const getChatHistory = async (req, res) => {
    try{
        const chatHistory = await chatService.getChatHistory(req.params.roomId);
        return res.status(200).json({
            status: 'success',
            data: chatHistory,
            message: 'Chat history fetched successfully',
            error: null
        })
    }catch(error){
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while fetching chat history',
            error: error.message
        })
    }
}
const uploadFile = async (req, res) => {
    try{
        const data = req.body;
        if(req.file){
            data.mediaUrl = req.file.path;
        }
        return res.status(200).json({
            status: 'success',
            data : data.mediaUrl,
            message: 'Chat uploaded successfully',
            error: null
        })
    }catch(error) {
        return res.status(500).json({
            status: 'error',
            data: null,
            message: 'An error occurred while uploading chat',
            error: error.message
        })
    }
}

module.exports = {
    getChatHistory,
    uploadFile
}