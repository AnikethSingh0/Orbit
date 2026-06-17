import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import TweetCard from './TweetCard';
import PostComposer from './PostComposer';
import LoadingSkeleton from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { fetchTweets, fetchHomeFeed } from '../lib/api';
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
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [offset, setOffset] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
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
        setFetchTrigger(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    
    if (node) observer.current.observe(node);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadTweets = async () => {
      try {
        if (fetchTrigger === 0) setLoading(true);
        else setIsFetchingMore(true);

        let res, data;
        if (token) {
          const currentCursor = fetchTrigger === 0 ? null : nextCursor;
          ({ res, data } = await fetchHomeFeed(currentCursor, LIMIT));
        } else {
          const currentOffset = fetchTrigger === 0 ? 0 : offset + LIMIT;
          if (isMounted) setOffset(currentOffset);
          ({ res, data } = await fetchTweets(currentOffset, LIMIT));
        }
        
        if (!res.ok || data?.status !== 'success') {
          throw new Error(data?.message || 'Failed to fetch tweets');
        }
        
        if (isMounted && data.data) {
          let fetchedTweets = Array.isArray(data.data) ? data.data : [];

          if (fetchTrigger === 0) {
            setTweets(fetchedTweets);
          } else {
            setTweets(prev => {
              const idSet = new Set(prev.map(t => t._id));
              const newTweets = fetchedTweets.filter(t => !idSet.has(t._id));
              return [...prev, ...newTweets];
            });
          }
          
          if (token) {
            if (data.nextCursor) {
              setNextCursor(data.nextCursor);
              setHasMore(fetchedTweets.length >= LIMIT);
            } else {
              setHasMore(false);
            }
          } else {
            if (fetchedTweets.length < LIMIT) {
              setHasMore(false);
            }
          }
        }
      } catch {
        if (isMounted) addToast('Failed to fetch timeline', 'error');
      } finally {
        if (isMounted) {
          setTimeout(() => {
             setLoading(false);
             setIsFetchingMore(false);
          }, fetchTrigger === 0 ? 500 : 300);
        }
      }
    };
    
    loadTweets();
    
    return () => { isMounted = false; };
  }, [fetchTrigger, token, addToast]);

  const handlePostSuccess = (newTweet) => {
    setTweets(prev => [newTweet, ...prev]);
  };

  return (
    <main className="feed">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Home</h2>
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
