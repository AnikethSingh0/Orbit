import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, UserPlus, MessageCircle, Bell, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { getImageUrl } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { notifications, markAllAsRead, unreadCount } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Mark all as read when unmounting or leaving the page
    return () => {
      if (unreadCount > 0) {
        markAllAsRead();
      }
    };
  }, [markAllAsRead, unreadCount]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={24} className="text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus size={24} className="text-[#1d9bf0]" />;
      case 'comment': return <MessageCircle size={24} className="text-green-500 fill-green-500" />;
      default: return <Bell size={24} className="text-[#1d9bf0]" />;
    }
  };

  const handleNotificationClick = (notif) => {
    const { type, targetId, sender } = notif.notification;
    
    if (type === 'follow' && sender?._id) {
      navigate(`/profile/${sender._id}`);
    } else if (targetId) {
      // Future: Navigate to specific post/tweet
      console.log('Navigate to target:', targetId);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-r border-white/10 min-h-screen bg-black overflow-hidden relative">
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" className="rounded-full text-xs py-1" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center mt-20">
            <div className="bg-white/5 p-6 rounded-full mb-6">
              <Bell size={48} className="text-[#1d9bf0]" />
            </div>
            <h3 className="text-3xl font-black mb-2">Nothing to see here — yet</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              When someone likes or replies to one of your posts, or follows you, you'll find it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif, i) => {
              const sender = notif.notification?.sender;
              const displayName = sender?.fullName || sender?.username || 'Someone';
              const type = notif.notification?.type;
              
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`border-b border-white/10 p-4 hover:bg-white/5 cursor-pointer transition-colors ${!notif.isRead ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 pt-1 w-10 flex justify-end">
                      {getNotificationIcon(type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Avatar 
                        name={displayName} 
                        src={sender ? getImageUrl(sender.avatar) : null} 
                        size="sm" 
                        className="mb-2"
                      />
                      
                      <div className="text-[15px] mb-1">
                        <span className="font-bold hover:underline" onClick={(e) => {
                          e.stopPropagation();
                          if (sender?._id) navigate(`/profile/${sender._id}`);
                        }}>
                          {displayName}
                        </span>{' '}
                        {type === 'like' && 'liked your post'}
                        {type === 'follow' && 'followed you'}
                        {type === 'comment' && 'replied to your post'}
                        {!['like', 'follow', 'comment'].includes(type) && notif.message}
                      </div>

                      {notif.notification?.targetId && type !== 'follow' && (
                        <div className="text-gray-500 text-[15px] mt-2 line-clamp-3 bg-white/5 p-3 rounded-xl border border-white/5">
                          {/* We don't have the post content here, so just a placeholder or the actual message */}
                          <span className="italic text-gray-600">Post details...</span>
                        </div>
                      )}
                      
                      <div className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                        {formatDistanceToNow(notif.id, { addSuffix: true })}
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#1d9bf0]"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
