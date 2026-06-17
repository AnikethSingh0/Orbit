import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Bell, Heart, UserPlus, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import { getImageUrl } from '../lib/utils';
import NotificationDropdown from '../components/NotificationDropdown';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children, userProfile }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(`notifications_${userProfile?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.id) {
      localStorage.setItem(`notifications_${userProfile.id}`, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.isRead).length);
    }
  }, [notifications, userProfile?.id]);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play prevented by browser policy', e));
    }
  }, []);

  const handleNewNotification = useCallback((data) => {
    // eslint-disable-next-line react-hooks/purity
    const id = Date.now();
    const newNotif = { id, isRead: false, ...data };
    
    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound();
  }, [playNotificationSound]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  useEffect(() => {
    // Create an audio element for the notification sound
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=message-incoming-132126.mp3");
    audio.volume = 0.6;
    audioRef.current = audio;
  }, []);

  useEffect(() => {
    if (!userProfile?.id) return;

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '');
    const socket = io(baseUrl, { withCredentials: true });
    if (socket.disconnected) {
      socket.connect();
    }
    socketRef.current = socket;

    const handleConnect = () => {
      console.log('Notification socket connected');
      socketRef.current.emit('joinNotificationRoom', { userId: userProfile._id || userProfile.id });
    };

    if (socketRef.current.connected) {
      handleConnect();
    } else {
      socketRef.current.on('connect', handleConnect);
    }

    socketRef.current.on('newNotification', (data) => {
      handleNewNotification(data);
    });

    return () => {
      socketRef.current.off('connect', handleConnect);
      socketRef.current.off('newNotification');
    };
  }, [userProfile?.id, handleNewNotification]);



  // For testing purposes, uncomment to trigger a fake notification
  /*
  useEffect(() => {
    if (!userProfile) return;
    const timer = setTimeout(() => {
      handleNewNotification({
        notification: {
          type: 'like',
          sender: { username: 'test_user', avatar: null, fullName: 'Test User' },
          targetId: '123'
        },
        message: 'You have 1 new like notifications'
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [userProfile]);
  */

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={20} className="text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus size={20} className="text-blue-500" />;
      case 'comment': return <MessageCircle size={20} className="text-green-500" />;
      default: return <Bell size={20} className="text-[#1d9bf0]" />;
    }
  };

  const handleNotificationClick = (notif) => {
    const { type, targetId, sender } = notif.notification;
    dismissNotification(notif.id);
    
    if (type === 'follow' && sender?._id) {
      navigate(`/profile/${sender._id}`);
    } else if (targetId) {
      // Navigate to post or specific target
      // Example: navigate(`/post/${targetId}`);
      console.log('Navigate to target:', targetId);
    }
  };

  const [popupNotifications, setPopupNotifications] = useState([]);

  useEffect(() => {
    const handlePopup = (notif) => {
      setPopupNotifications(prev => [...prev, notif]);
      setTimeout(() => {
        setPopupNotifications(prev => prev.filter(n => n.id !== notif.id));
      }, 5000);
    };

    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only show popup if it's very recent (within 1 second of creation)
      if (Date.now() - latest.id < 1000) {
        handlePopup(latest);
      }
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      dismissNotification, 
      unreadCount, 
      markAllAsRead,
      isDropdownOpen,
      setIsDropdownOpen,
      toggleDropdown: () => setIsDropdownOpen(prev => !prev),
      closeDropdown: () => setIsDropdownOpen(false)
    }}>
      {children}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[350px]">
        <AnimatePresence>
          {popupNotifications.map((notif) => {
            const sender = notif.notification?.sender;
            const displayName = sender?.fullName || sender?.username || 'Someone';
            
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20, transition: { duration: 0.2 } }}
                className="bg-[#202327] border border-white/10 rounded-2xl p-3 shadow-2xl pointer-events-auto cursor-pointer relative overflow-hidden group"
                onClick={() => handleNotificationClick(notif)}
              >
                {/* Glossy top highlight */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopupNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                  }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar 
                      name={displayName} 
                      src={sender ? getImageUrl(sender.avatar) : null} 
                      size="md" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#202327] rounded-full p-1 shadow-sm">
                      {getNotificationIcon(notif.notification?.type)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0 pr-4">
                    <span className="font-bold text-[15px] text-white truncate">
                      {displayName}
                    </span>
                    <span className="text-[14px] text-gray-400 leading-tight line-clamp-2 mt-0.5">
                      {(() => {
                        const count = notif.notification?.count || 1;
                        const type = notif.notification?.type;
                        if (type === 'like') {
                          return count > 1 ? `and ${count - 1} others liked your post` : 'liked your post';
                        }
                        if (type === 'follow') {
                          return count > 1 ? `and ${count - 1} others started following you` : 'started following you';
                        }
                        if (type === 'comment') {
                          return count > 1 ? `and ${count - 1} others commented on your post` : 'commented on your post';
                        }
                        return notif.message;
                      })()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <NotificationDropdown />
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => useContext(NotificationContext);
