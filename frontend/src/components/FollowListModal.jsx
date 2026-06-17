import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { fetchFollowers, fetchFollowing, toggleFollow } from '../lib/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}/${path.replace(/\\/g, '/')}`;
};

const FollowListModal = ({ isOpen, onClose, type, userId, currentUserProfile }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const fetchFn = type === 'followers' ? fetchFollowers : fetchFollowing;
        const { res, data } = await fetchFn(userId);
        
        let list = [];
        if (res.ok && data.status === 'success') {
          list = data.data.map(item => type === 'followers' ? item.follower : item.following).filter(Boolean);
          setUsers(list);
        }

        if (currentUserProfile?.id) {
          const { res: myFollowingRes, data: myFollowingData } = await fetchFollowing(currentUserProfile.id);
          if (myFollowingRes.ok && myFollowingData.status === 'success') {
            const myFollowingList = myFollowingData.data.map(item => item.following?._id);
            setFollowingIds(new Set(myFollowingList));
          }
        }
      } catch (error) {
        console.error("Error loading follow list", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, type, userId, currentUserProfile]);

  const handleToggleFollow = async (targetUserId) => {
    try {
      const { res } = await toggleFollow(targetUserId);
      if (res.ok) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(targetUserId)) {
            newSet.delete(targetUserId);
          } else {
            newSet.add(targetUserId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling follow", error);
    }
  };

  const handleUserClick = (id) => {
    onClose();
    navigate(`/profile/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-black border border-white/10 sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[400px] flex flex-col shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="flex items-center justify-center p-4 border-b border-white/10 relative shrink-0">
              <h2 className="text-[17px] font-bold capitalize tracking-wide">{type}</h2>
              <button 
                onClick={onClose} 
                className="absolute right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1da1f2]"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center p-12 text-gray-500">
                  <p className="text-lg font-bold text-white mb-1">No {type} yet</p>
                  <p className="text-sm">When they get {type}, they'll show up here.</p>
                </div>
              ) : (
                <div className="flex flex-col py-2">
                  {users.map((user) => {
                    const isFollowing = followingIds.has(user._id);
                    const isSelf = currentUserProfile?.id === user._id;
                    const fullName = user.fullName || user.username;
                    const avatarUrl = getImageUrl(user.avatar);

                    return (
                      <div key={user._id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group">
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => handleUserClick(user._id)}
                        >
                          <Avatar name={fullName} src={avatarUrl} size="md" className="shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-[15px] text-white hover:underline truncate">{fullName}</span>
                            <span className="text-[14px] text-gray-500 truncate">@{user.username}</span>
                          </div>
                        </div>
                        
                        {!isSelf && currentUserProfile && (
                          <Button 
                            variant="primary"
                            className={`ml-3 shrink-0 rounded-full font-bold px-4 py-1.5 text-sm min-w-[100px] transition-all ${
                              isFollowing 
                                ? 'bg-transparent border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 group-hover:border-red-500 group-hover:text-red-500' 
                                : 'bg-white text-black hover:bg-gray-200 border border-transparent'
                            }`}
                            onClick={() => handleToggleFollow(user._id)}
                            onMouseEnter={(e) => {
                               if (isFollowing) e.target.innerText = 'Unfollow';
                            }}
                            onMouseLeave={(e) => {
                               if (isFollowing) e.target.innerText = 'Following';
                            }}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FollowListModal;
