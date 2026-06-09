import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, UserPlus, MessageCircle, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import Avatar from './ui/Avatar';
import { getImageUrl, formatRelativeTime } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const NotificationDropdown = () => {
  const { notifications, isDropdownOpen, closeDropdown, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isDropdownOpen) {
      markAllAsRead();
    }
  }, [isDropdownOpen, markAllAsRead]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking the bell icon itself (handled by toggle)
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('.notification-toggle-btn')) {
        closeDropdown();
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, closeDropdown]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus size={16} className="text-blue-500" />;
      case 'comment': return <MessageCircle size={16} className="text-green-500" />;
      default: return <Bell size={16} className="text-[#1d9bf0]" />;
    }
  };

  const handleNotificationClick = (notif) => {
    const { type, targetId, sender } = notif;
    closeDropdown();
    
    if (type === 'follow' && sender?._id) {
      navigate(`/profile/${sender._id}`);
    } else if (targetId) {
      // navigate(`/post/${targetId}`);
    }
  };

  return (
    <AnimatePresence>
      {isDropdownOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm" 
            onClick={closeDropdown} 
          />
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[100] w-[90vw] sm:w-[400px] h-[80vh] sm:h-[500px] max-h-[80vh] flex flex-col bg-[#0a0a0d] border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden 
                       bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-[80px] xl:left-[270px] sm:bottom-6"
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0d]/80 backdrop-blur-md sticky top-0 z-10">
            <h2 className="font-bold text-xl text-white">Notifications</h2>
            <div className="flex gap-2">
              <button 
                onClick={closeDropdown}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors sm:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
                <Bell size={32} className="opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => {
                  const sender = notif.sender || notif.notification?.sender;
                  const displayName = sender?.fullName || sender?.username || 'Someone';
                  const count = notif.count || notif.notification?.count || 1;
                  const type = notif.type || notif.notification?.type;
                  
                  let message = notif.message;
                  if (type === 'like') {
                    message = count > 1 ? `and ${count - 1} others liked your post` : 'liked your post';
                  } else if (type === 'follow') {
                    message = count > 1 ? `and ${count - 1} others started following you` : 'started following you';
                  } else if (type === 'comment') {
                    message = count > 1 ? `and ${count - 1} others commented on your post` : 'commented on your post';
                  }

                  return (
                    <div 
                      key={notif.id || notif._id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex gap-4 cursor-pointer transition-colors hover:bg-white/[0.03] ${!notif.isRead ? 'bg-[#1d9bf0]/[0.03]' : ''}`}
                    >
                      <div className="mt-1 shrink-0">
                        {getNotificationIcon(type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar 
                            name={displayName} 
                            src={sender ? getImageUrl(sender.avatar) : null} 
                            size="sm" 
                          />
                        </div>
                        <p className="text-[15px] text-gray-200 leading-snug">
                          <span className="font-bold text-white hover:underline">{displayName}</span>{' '}
                          <span className="text-gray-400">{message}</span>
                        </p>
                        <span className="text-[13px] text-gray-500 mt-1 block">
                          {formatRelativeTime(notif.createdAt || notif.id)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
