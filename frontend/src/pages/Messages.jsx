import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, Check, CheckCheck, Loader2, Image as ImageIcon, X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { fetchFollowing, fetchFollowers, fetchChatHistory, fetchProfile, uploadChatMedia } from '../lib/api';
import { getImageUrl } from '../lib/utils';

const Messages = ({ userProfile }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const getRoomId = (id1, id2) => {
    if (!id1 || !id2) return '';
    return [id1.toString(), id2.toString()].sort().join('_');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect Socket
  useEffect(() => {
    if (!userProfile?.id) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');
    socketRef.current = io(baseUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      if (activeChatRef.current && userProfile?.id) {
        socketRef.current.emit('joinRoom', { senderId: userProfile.id, receiverId: activeChatRef.current._id });
      }
    });

    socketRef.current.on('newChatMessage', (message) => {
      setMessages((prev) => {
        // Only add if it belongs to the current room
        const currentRoomId = getRoomId(userProfile.id, activeChatRef.current?._id);
        if (message.roomId === currentRoomId) {
          // If we receive a message from the other person and we're in the room, mark it as read
          if (message.senderId !== userProfile.id) {
            socketRef.current.emit('markAsRead', { roomId: currentRoomId, userId: userProfile.id });
          }
          return [...prev, message];
        }
        return prev;
      });
    });

    socketRef.current.on('messagesMarkedAsRead', ({ roomId, userId: readByUserId }) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.roomId === roomId && msg.receiverId === readByUserId 
            ? { ...msg, isRead: true } 
            : msg
        )
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userProfile?.id]);

  // Load Contacts (Followers + Following)
  useEffect(() => {
    if (!userProfile?.id) return;

    const loadContacts = async () => {
      setLoadingContacts(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetchFollowers(userProfile.id),
          fetchFollowing(userProfile.id)
        ]);

        const uniqueUsers = new Map();

        if (followersRes.res.ok && followersRes.data.status === 'success') {
          followersRes.data.data.forEach(f => {
            if (f.follower) uniqueUsers.set(f.follower._id, f.follower);
          });
        }

        if (followingRes.res.ok && followingRes.data.status === 'success') {
          followingRes.data.data.forEach(f => {
            if (f.following) uniqueUsers.set(f.following._id, f.following);
          });
        }

        // Also fetch profile of `userId` from URL if not in contacts
        if (userId && !uniqueUsers.has(userId)) {
          const profileRes = await fetchProfile(userId);
          if (profileRes.res.ok && profileRes.data.status === 'success') {
             uniqueUsers.set(userId, profileRes.data.data.user);
          }
        }

        setContacts(Array.from(uniqueUsers.values()));
      } catch (error) {
        console.error("Error loading contacts", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    loadContacts();
  }, [userProfile?.id, userId]);

  // Set active chat and fetch history
  useEffect(() => {
    if (!userId || !userProfile?.id) {
      setActiveChat(null);
      return;
    }

    const targetUser = contacts.find(c => c._id === userId);
    
    if (targetUser) {
      setActiveChat(targetUser);
      loadChatHistory(targetUser);
    } else {
      // It might not be in contacts yet, will be set when contacts load
      if (!loadingContacts) {
        // Fallback if not found
      }
    }
  }, [userId, contacts, userProfile?.id, loadingContacts]);

  const loadChatHistory = async (targetUser) => {
    setLoadingChat(true);
    const roomId = getRoomId(userProfile.id, targetUser._id);
    
    // Join room
    socketRef.current?.emit('joinRoom', { senderId: userProfile.id, receiverId: targetUser._id });

    try {
      const { res, data } = await fetchChatHistory(roomId);
      if (res.ok && data.status === 'success') {
        setMessages(data.data);
        
        // Mark as read when opening
        socketRef.current?.emit('markAsRead', { roomId, userId: userProfile.id });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !mediaFile) || !activeChat || !userProfile?.id || isUploading) return;

    const roomId = getRoomId(userProfile.id, activeChat._id);
    let mediaUrl = null;

    if (mediaFile) {
      setIsUploading(true);
      try {
        const { res, data } = await uploadChatMedia(mediaFile);
        if (res.ok && data.status === 'success') {
          mediaUrl = data.data; // URL returned by the backend
        } else {
          console.error("Failed to upload media");
        }
      } catch (err) {
        console.error("Error uploading media:", err);
      } finally {
        setIsUploading(false);
      }
    }
    
    socketRef.current.emit('chatMessage', {
      roomId,
      senderId: userProfile.id,
      receiverId: activeChat._id,
      message: messageInput.trim() || ' ', // Backend requires message, send space if only image
      mediaUrl
    });

    setMessageInput('');
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-pointer backdrop-blur-sm"
            onClick={() => setZoomedImage(null)}
          >
            <button 
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={getImageUrl(zoomedImage)} 
              alt="Zoomed" 
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex h-[100dvh] overflow-hidden">
      {/* Left Sidebar - Contacts List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-24 md:pb-2">
          {loadingContacts ? (
            <div className="flex justify-center p-8 text-gray-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>No contacts found.</p>
              <p className="text-sm mt-2">Follow some people to start chatting!</p>
            </div>
          ) : (
            contacts.map(contact => {
              const isActive = activeChat?._id === contact._id;
              const displayName = contact.fullName || contact.name || contact.username;
              return (
                <div 
                  key={contact._id}
                  onClick={() => navigate(`/messages/${contact._id}`)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <Avatar name={displayName} src={getImageUrl(contact.avatar)} size="md" />
                  <div className="flex-1 min-w-0 ml-1">
                    <div className="font-bold text-[16px] truncate text-white">{displayName}</div>
                    <div className="text-gray-400 text-[14.5px] truncate">@{contact.username}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area - Chat Area */}
      <div className={`flex-1 flex flex-col bg-black relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-3xl font-black mb-2">Select a message</h2>
            <p className="text-gray-500 max-w-sm">Choose from your existing conversations, start a new one, or just keep swimming.</p>
            <Button className="mt-6 rounded-full font-bold px-8" onClick={() => navigate('/explore')}>
              Find People
            </Button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-3 flex items-center gap-4 z-10">
              <button 
                onClick={() => navigate('/messages')}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div 
                className="flex items-center gap-3.5 cursor-pointer"
                onClick={() => navigate(`/profile/${activeChat._id}`)}
              >
                <Avatar 
                  name={activeChat.fullName || activeChat.name || activeChat.username} 
                  src={getImageUrl(activeChat.avatar)} 
                  size="md" 
                />
                <div>
                  <h3 className="font-bold text-[16px] leading-tight">
                    {activeChat.fullName || activeChat.name || activeChat.username}
                  </h3>
                  <p className="text-gray-400 text-[14.5px] leading-tight mt-0.5">@{activeChat.username}</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
              {loadingChat ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <Loader2 className="animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <p className="text-lg">No messages yet.</p>
                  <p className="text-gray-500 mt-1">Say hi to @{activeChat.username}!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // The backend might return senderId as an object if populated, or just string.
                  const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                  const isMine = senderIdStr === userProfile?.id;
                  
                  // Check if previous message was from the same sender to group them
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const prevSenderIdStr = prevMsg ? (typeof prevMsg.senderId === 'object' ? prevMsg.senderId._id : prevMsg.senderId) : null;
                  const isFirstInGroup = senderIdStr !== prevSenderIdStr;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg._id || idx} 
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${isFirstInGroup ? 'mt-2' : 'mt-0'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                        {!isMine && isFirstInGroup && (
                          <Avatar 
                            name={activeChat.fullName || activeChat.username} 
                            src={getImageUrl(activeChat.avatar)} 
                            size="sm" 
                            className="mb-1"
                          />
                        )}
                        {!isMine && !isFirstInGroup && <div className="w-8" />} {/* Spacer for grouped messages */}

                        <div 
                          className={`
                            px-5 py-3 text-[16px] leading-relaxed shadow-sm flex flex-col gap-2
                            ${isMine 
                              ? 'bg-[#1d9bf0] text-white rounded-2xl rounded-br-sm' 
                              : 'bg-[#2f3336] text-white rounded-2xl rounded-bl-sm'
                            }
                          `}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {msg.mediaUrl && (
                            <img 
                              src={getImageUrl(msg.mediaUrl)} 
                              alt="Uploaded media" 
                              className="rounded-xl max-w-full md:max-w-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => setZoomedImage(msg.mediaUrl)}
                            />
                          )}
                          {msg.message && msg.message.trim() !== '' && <div>{msg.message}</div>}
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${!isMine && 'ml-10'}`}>
                        <span>{format(new Date(msg.createdAt || new Date()), 'h:mm a')}</span>
                        {isMine && (
                          msg.isRead ? (
                            <CheckCheck size={15} className="text-white ml-0.5" />
                          ) : (
                            <Check size={15} className="text-white/80 ml-0.5" />
                          )
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black flex flex-col gap-2">
              {/* Media Preview Area */}
              {mediaPreview && (
                <div className="relative inline-block self-start mb-2">
                  <img src={mediaPreview} alt="Preview" className="h-32 w-auto rounded-xl object-cover border border-white/10" />
                  <button 
                    onClick={removeMedia}
                    className="absolute -top-2 -right-2 bg-gray-900/90 backdrop-blur-sm text-white rounded-full p-1 border border-white/20 hover:bg-gray-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div className="relative" ref={emojiPickerRef}>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden">
                    <EmojiPicker 
                      theme="dark"
                      onEmojiClick={(emojiData) => setMessageInput(prev => prev + emojiData.emoji)}
                    />
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-2 rounded-full transition-colors flex-shrink-0"
                  title="Upload Image"
                  disabled={isUploading}
                >
                  <ImageIcon size={22} />
                </button>
                <button 
                  type="button" 
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className="text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-2 rounded-full transition-colors flex-shrink-0"
                  title="Add Emoji"
                  disabled={isUploading}
                >
                  <Smile size={22} />
                </button>
                <div className="flex-1 bg-[#202327] rounded-full px-4 py-2 flex items-center">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Start a new message..."
                    className="flex-1 bg-transparent border-none outline-none text-[16px] text-white placeholder-gray-500 h-10"
                    disabled={isUploading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={(!messageInput.trim() && !mediaFile) || isUploading}
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default Messages;
