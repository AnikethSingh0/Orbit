import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { fetchTrendingHashtags, searchUsers, fetchTweets } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

const Explore = () => {
  const [trendingTags, setTrendingTags] = useState([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [showAllTrends, setShowAllTrends] = useState(false);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const { data } = await fetchTrendingHashtags();
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          setTrendingTags(data.data);
        }
      } catch (err) {
        console.error("Failed to load trending tags:", err);
      } finally {
        setIsLoadingTrends(false);
      }
    };
    loadTrending();
  }, []);

  // Load Suggested Users (from latest tweets)
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const { data } = await fetchTweets(0, 20);
        if (data && data.status === 'success' && Array.isArray(data.data)) {
          const uniqueUsers = [];
          const userIds = new Set();
          data.data.forEach(tweet => {
            if (tweet.user && !userIds.has(tweet.user._id)) {
              userIds.add(tweet.user._id);
              uniqueUsers.push(tweet.user);
            }
          });
          setSuggestedUsers(uniqueUsers);
        }
      } catch (err) {
        console.error("Failed to load suggested users:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    loadSuggestions();
  }, []);

  // Search effect
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const { res, data } = await searchUsers(debouncedQuery);
        if (res.ok && data && data.status === 'success' && Array.isArray(data.data)) {
          setSearchResults(data.data);
        } else {
          setSearchResults([]);
          setSearchError(data?.error || data?.message || 'API error: Unknown format');
        }
      } catch (err) {
        console.error('Failed to search users:', err);
        setSearchResults([]);
        setSearchError(err.message);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="feed overflow-y-auto h-screen custom-scrollbar pb-20 relative">
      <div className="sticky top-0 bg-black/80 backdrop-blur-md pt-3 pb-3 px-4 z-20 border-b border-white/10">
        <div className="relative">
          <div className="flex items-center bg-[#202327] rounded-full px-4 py-2 focus-within:bg-black focus-within:ring-1 focus-within:ring-[#1d9bf0] transition-all relative">
            <Search size={18} className="text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="Search Orbit" 
              aria-label="Search users" 
              className="bg-transparent border-none outline-none text-white w-full text-[15px] placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }} 
                className="absolute right-3 p-1 rounded-full bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]"
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* If searching, show results, else show trends and suggestions */}
        {searchQuery.trim() ? (
          <div className="bg-[#16181c] rounded-2xl overflow-hidden min-h-[200px]">
            {isSearching ? (
              <div className="flex justify-center items-center py-8 text-gray-500">
                <Loader2 className="animate-spin text-[#1d9bf0]" size={24} />
              </div>
            ) : searchError ? (
              <div className="py-8 px-4 text-center text-red-500 text-[14px]">
                Backend Error: {searchError}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col">
                {searchResults.map((user) => (
                  <Link 
                    to={`/profile/${user._id}`} 
                    key={user._id}
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <Avatar name={user.fullName || user.username} src={user.avatar} size="md" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-[15px] truncate">{user.fullName || user.username}</span>
                      <span className="text-[#71767b] text-[15px] truncate">@{user.username}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center text-[#71767b] text-[16px] font-bold">
                No results for "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          <>
            <section className="bg-[#16181c] rounded-2xl p-4 mb-4">
              <h2 className="text-xl font-extrabold text-white mb-4">Trends for you</h2>
              
              {isLoadingTrends ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-[#3b82f6]" size={24} />
                </div>
              ) : trendingTags.length > 0 ? (
                (showAllTrends ? trendingTags : trendingTags.slice(0, 5)).map((trend, index) => (
                  <a href={`/search?q=%23${trend.tag}`} className="block py-3 hover:bg-gradient-to-r hover:from-white/[0.04] hover:to-transparent -mx-4 px-4 transition-colors group border-l-2 border-transparent hover:border-[#1d9bf0]" key={trend.tag}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2 group-hover:translate-x-1 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#71767b] tracking-widest uppercase">
                            <TrendingUp size={12} className="text-[#1d9bf0]" />
                            {index + 1} · Trending
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[17px] font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1d9bf0] group-hover:to-[#a855f7] transition-all truncate pr-3">
                            #{trend.tag}
                          </div>
                          <div className="text-[12px] font-bold text-[#1d9bf0] bg-[#1d9bf0]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                            {trend.score >= 1000 ? (trend.score / 1000).toFixed(1) + 'k' : trend.score} posts
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-gray-500 text-[15px] py-4 text-center">
                  No trending hashtags right now.
                </div>
              )}
              {trendingTags.length > 5 && (
                <button 
                  onClick={() => setShowAllTrends(!showAllTrends)}
                  className="block w-full text-left mt-2 text-[#1d9bf0] hover:bg-white/5 text-[15px] py-3 -mx-4 px-5 rounded-b-2xl transition-colors"
                >
                  {showAllTrends ? 'Show less' : 'Show more'}
                </button>
              )}
            </section>

            <section className="bg-[#16181c] rounded-2xl p-4 mb-4">
              <h2 className="text-xl font-extrabold text-white mb-4">Who to follow</h2>
              
              {isLoadingSuggestions ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-[#1d9bf0]" size={24} />
                </div>
              ) : suggestedUsers.length > 0 ? (
                (showAllSuggestions ? suggestedUsers : suggestedUsers.slice(0, 5)).map((user) => (
                  <div key={user._id} className="flex items-center justify-between py-3 hover:bg-white/5 -mx-4 px-4 transition-colors">
                    <Link to={`/profile/${user._id}`} className="flex items-center gap-3 overflow-hidden group">
                      <Avatar name={user.fullName || user.username} src={user.avatar} size="md" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#e7e9ea] text-[15px] group-hover:underline truncate">{user.fullName || user.username}</span>
                        <p className="text-[#71767b] text-[14px] truncate">@{user.username}</p>
                      </div>
                    </Link>
                    <Button variant="secondary" size="sm" className="ml-2 shrink-0 rounded-full font-bold bg-white text-black hover:bg-gray-200">Follow</Button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-[#71767b] text-[15px]">
                  No suggestions for now.
                </div>
              )}

              {suggestedUsers.length > 5 && (
                <button 
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="block w-full text-left mt-2 text-[#1d9bf0] hover:bg-white/5 text-[15px] py-3 -mx-4 px-5 rounded-b-2xl transition-colors"
                >
                  {showAllSuggestions ? 'Show less' : 'Show more'}
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
