import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import TweetCard from '../components/TweetCard';
import CommentThread from '../components/CommentThread';
import FollowListModal from '../components/FollowListModal';
import { fetchProfile, toggleFollow, fetchFollowing } from '../lib/api';
import { formatRelativeTime, renderContentWithHashtags } from '../lib/utils';

const tabs = ['Posts', 'Replies', 'Media', 'Likes'];

// Helper to normalize backend paths for images
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Assuming backend runs on 3000 and serves uploads statically, or use VITE_API_BASE_URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}/${path.replace(/\\/g, '/')}`;
};

const Profile = ({ userProfile: jwtProfile }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCommentTweet, setActiveCommentTweet] = useState(null);
  const [isFollowListOpen, setIsFollowListOpen] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [localFollowersCount, setLocalFollowersCount] = useState(0);
  const [localFollowingCount, setLocalFollowingCount] = useState(0);

  const handleOpenComments = (tweet) => {
    setActiveCommentTweet(tweet);
  };

  const handleCloseComments = () => {
    setActiveCommentTweet(null);
  };

  const handleCommentAdded = (tweetId = activeCommentTweet?._id) => {
    if (!tweetId) return;

    setActiveCommentTweet((prev) => (
      prev && prev._id === tweetId
        ? { ...prev, commentCount: (prev.commentCount || 0) + 1 }
        : prev
    ));
    
    setProfileData(prev => {
      if (!prev || !prev.tweets) return prev;
      return {
        ...prev,
        tweets: prev.tweets.map(t => t._id === tweetId ? { ...t, commentCount: (t.commentCount || 0) + 1 } : t)
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      const targetId = userId || jwtProfile?.id;
      if (!targetId) {
        setLoading(false);
        return;
      }
      
      if (isMounted) {
        setLoading(true);
        // Clear previous profile data when navigating to a new user
        setProfileData(null);
      }
      
      try {
        const { res, data } = await fetchProfile(targetId);
        if (isMounted && res.ok && data.status === 'success') {
          setProfileData(data.data);
          
          setLocalFollowersCount(data.data?.user?.followersCount || 0);
          setLocalFollowingCount(data.data?.user?.followingCount || 0);



          if (jwtProfile?.id && targetId !== jwtProfile.id) {
            const { res: followingRes, data: followingData } = await fetchFollowing(jwtProfile.id);
            if (followingRes.ok && followingData.status === 'success') {
              const isFollowing = followingData.data.some(f => f.following?._id === targetId);
              setIsFollowingProfile(isFollowing);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [userId, jwtProfile]);

  const handleToggleProfileFollow = async () => {
    const targetId = profileData?.user?._id;
    if (!targetId) return;
    try {
      const { res } = await toggleFollow(targetId);
      if (res.ok) {
        setIsFollowingProfile(!isFollowingProfile);
        setLocalFollowersCount(prev => isFollowingProfile ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const openFollowList = (type) => {
    setFollowListType(type);
    setIsFollowListOpen(true);
  };

  if (loading) {
    return (
      <div className="feed overflow-y-auto h-screen custom-scrollbar pb-20">
        <div className="p-4">
          <LoadingSkeleton count={2} />
        </div>
      </div>
    );
  }

  // Fallback to jwtProfile if fetch fails, but only if it's our own profile
  const isOwnProfile = !userId || userId === jwtProfile?.id;
  const displayProfile = profileData?.user || (isOwnProfile ? (jwtProfile || {}) : {});
  const userTweets = profileData?.tweets || [];
  const userComments = profileData?.comments || [];
  
  const username = displayProfile.username || 'user';
  const fullName = displayProfile.fullName || displayProfile.name || username;
  const bio = displayProfile.bio || 'This is your bio. Add more details in setup.';
  const location = displayProfile.location || 'Earth';
  const joinedDate = displayProfile.createdAt ? new Date(displayProfile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'May 2026';
  
  const avatarUrl = getImageUrl(displayProfile.avatar);
  const bannerUrl = getImageUrl(displayProfile.banner);

  return (
    <div className="feed overflow-y-auto h-screen custom-scrollbar pb-20 relative">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-xs text-gray-500">Profile</p>
        </div>
      </div>

      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden relative">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          )}
        </div>
        
        <div className="px-4 relative pb-4 border-b border-white/10">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="rounded-full border-4 border-black bg-black p-1 relative z-20">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-28 h-28 rounded-full object-cover" />
              ) : (
                <Avatar name={fullName} size="lg" className="w-28 h-28 text-3xl" />
              )}
            </div>
            
            <div className="mt-20">
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="rounded-full font-bold px-4 py-2"
                    onClick={() => navigate('/setup')}
                  >
                    Edit profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full font-bold px-4 py-2 text-red-500 border-red-500/50 hover:bg-red-500/10 md:hidden"
                    onClick={() => {
                      import('../lib/api').then(({ removeToken }) => {
                        removeToken();
                        window.location.href = '/';
                      });
                    }}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="rounded-full font-bold w-10 h-10 p-0 flex items-center justify-center border-gray-500 text-white hover:bg-white/10"
                    onClick={() => navigate(`/messages/${displayProfile._id}`)}
                    aria-label="Message"
                  >
                    <Mail size={20} />
                  </Button>
                  <Button 
                    className={`rounded-full font-bold px-6 py-2 ${
                      isFollowingProfile 
                        ? 'border border-gray-500 bg-transparent text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' 
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                    onClick={handleToggleProfileFollow}
                  >
                    {isFollowingProfile ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-black">{fullName}</h1>
            <p className="text-gray-500 text-sm">@{username}</p>
          </div>
          
          <div className="mt-4 text-[15px]">
            <p>{bio}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon size={16} />
              <a href="#" className="text-[#1da1f2] hover:underline">orbit.com/{username}</a>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4 text-sm">
            <button onClick={() => openFollowList('following')} className="hover:underline text-left">
              <span className="font-bold text-white">{localFollowingCount}</span> <span className="text-gray-500">Following</span>
            </button>
            <button onClick={() => openFollowList('followers')} className="hover:underline text-left">
              <span className="font-bold text-white">{localFollowersCount}</span> <span className="text-gray-500">Followers</span>
            </button>
          </div>
        </div>

        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 font-bold py-4 text-center hover:bg-white/5 transition-colors relative"
            >
              <span className={activeTab === tab ? 'text-white' : 'text-gray-500'}>{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#14b8a6] rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
        
        {activeTab === 'Posts' && userTweets.length > 0 ? (
          <div className="divide-y divide-white/10">
            {userTweets.map(tweet => (
              <TweetCard 
                key={tweet._id} 
                tweet={tweet} 
                currentUserProfile={jwtProfile}
                onOpenComments={() => handleOpenComments(tweet)}
              />
            ))}
          </div>
        ) : activeTab === 'Replies' && userComments.length > 0 ? (
          <div className="divide-y divide-white/10">
            {userComments.map(comment => (
              <div key={comment._id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex gap-3">
                  <Avatar name={displayProfile.fullName || displayProfile.name || displayProfile.username} src={avatarUrl} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white hover:underline cursor-pointer">{displayProfile.fullName || displayProfile.name || displayProfile.username}</span>
                      <span className="text-gray-500 text-sm">@{displayProfile.username}</span>
                      <span className="text-gray-500 text-sm">&middot;</span>
                      <span className="text-gray-500 text-sm hover:underline cursor-pointer">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-white text-[15px]">
                      {renderContentWithHashtags(comment.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4 text-4xl">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">No {activeTab.toLowerCase()} yet</h3>
            <p>When you have {activeTab.toLowerCase()}, they will show up here.</p>
          </div>
        )}
      </div>

      <CommentThread 
        tweet={activeCommentTweet}
        isOpen={!!activeCommentTweet}
        onClose={handleCloseComments}
        onCommentAdded={handleCommentAdded}
        userProfile={jwtProfile}
      />

      <FollowListModal 
        isOpen={isFollowListOpen}
        onClose={() => setIsFollowListOpen(false)}
        type={followListType}
        userId={userId || jwtProfile?.id}
        currentUserProfile={jwtProfile}
      />
    </div>
  );
};

export default Profile;
