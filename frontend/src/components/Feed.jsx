import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import TweetCard from './TweetCard';
import PostComposer from './PostComposer';
import LoadingSkeleton from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { fetchTweets } from '../lib/api';
import { MessageSquare } from 'lucide-react';

const LIMIT = 10;

const Feed = ({
  token,
  userProfile,
  onOpenComments,
  commentAdjustments = {},
}) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { addToast } = useToast();

  const hasMoreRef = useRef(hasMore);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const isFetchingMoreRef = useRef(isFetchingMore);
  useEffect(() => { isFetchingMoreRef.current = isFetchingMore; }, [isFetchingMore]);

  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const observer = useRef();

  const lastTweetElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current && !isFetchingMoreRef.current) {
        setOffset(prevOffset => prevOffset + LIMIT);
      }
    }, { threshold: 0.1 });
    
    if (node) observer.current.observe(node);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadTweets = async () => {
      try {
        if (offset === 0) setLoading(true);
        else setIsFetchingMore(true);

        const { res, data } = await fetchTweets(offset, LIMIT);
        
        if (isMounted && res.ok && data.status === 'success' && data.data) {
          let fetchedTweets = Array.isArray(data.data) ? data.data : [];

          if (fetchedTweets.length > LIMIT) {
            fetchedTweets = fetchedTweets.slice(offset, offset + LIMIT);
          }

          if (offset === 0) {
            setTweets(fetchedTweets);
          } else {
            setTweets(prev => {
              const idSet = new Set(prev.map(t => t._id));
              const newTweets = fetchedTweets.filter(t => !idSet.has(t._id));
              return [...prev, ...newTweets];
            });
          }
          
          if (fetchedTweets.length < LIMIT) {
            setHasMore(false);
          }
        }
      } catch {
        if (isMounted) addToast('Failed to fetch timeline', 'error');
      } finally {
        if (isMounted) {
          setTimeout(() => {
             setLoading(false);
             setIsFetchingMore(false);
          }, offset === 0 ? 500 : 300);
        }
      }
    };
    
    loadTweets();
    
    return () => { isMounted = false; };
  }, [offset, addToast]);

  const handlePostSuccess = (newTweet) => {
    setTweets(prev => [newTweet, ...prev]);
  };

  return (
    <main className="feed">
      <div className="sticky top-0 z-10 mb-6 bg-[rgba(15,15,18,0.7)] backdrop-blur-xl border-b border-white/5 px-6 py-4 rounded-b-2xl shadow-sm">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1">Orbit</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Home</h2>
        </div>
      </div>

      {token && (
        <PostComposer 
          userProfile={userProfile} 
          onPostSuccess={handlePostSuccess} 
        />
      )}

      <div className="tweets-list">
        {loading && offset === 0 ? (
          <LoadingSkeleton count={5} />
        ) : (
          <>
            <AnimatePresence>
              {tweets.map((tweet, index) => {
                const displayTweet = commentAdjustments[tweet._id]
                  ? { ...tweet, commentCount: Math.max(0, (tweet.commentCount || 0) + commentAdjustments[tweet._id]) }
                  : tweet;

                if (tweets.length === index + 1) {
                  return (
                    <div ref={lastTweetElementRef} key={tweet._id || `tweet-${index}`} style={{ width: '100%' }}>
                      <TweetCard 
                        tweet={displayTweet} 
                        currentUserProfile={userProfile}
                        onOpenComments={() => onOpenComments && onOpenComments(displayTweet)} 
                      />
                    </div>
                  );
                } else {
                  return (
                    <TweetCard 
                      key={tweet._id || `tweet-${index}`} 
                      tweet={displayTweet} 
                      currentUserProfile={userProfile}
                      onOpenComments={() => onOpenComments && onOpenComments(displayTweet)} 
                    />
                  );
                }
              })}
            </AnimatePresence>
            
            <div className="infinite-scroll-trigger">
              {isFetchingMore && (
                <div className="pagination-loader">
                  <div className="glowing-dot"></div>
                  <div className="glowing-dot" style={{animationDelay: '0.2s'}}></div>
                  <div className="glowing-dot" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
              {!hasMore && tweets.length > 0 && (
                <div className="end-of-feed-message">
                  You've caught up for now.
                </div>
              )}
            </div>
          </>
        )}
        {!loading && tweets.length === 0 && (
          <EmptyState 
            icon={MessageSquare}
            title="Welcome to Orbit"
            description="Your timeline is empty. Follow people or post something to get started!"
          />
        )}
      </div>
    </main>
  );
};

export default Feed;
