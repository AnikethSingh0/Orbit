import { useState, useEffect } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { fetchTrendingHashtags } from '../lib/api';

const suggestions = [
  { name: 'Linear', handle: 'linear' },
  { name: 'Vercel', handle: 'vercel' },
  { name: 'Cloudinary', handle: 'cloudinary' },
];

const RightSidebar = () => {
  const [trendingTags, setTrendingTags] = useState([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [showAllTrends, setShowAllTrends] = useState(false);

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

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-inner">
        <div className="sticky top-0 bg-black/80 backdrop-blur-md pt-2 pb-4 z-10">
          <div className="flex items-center bg-[#202327] rounded-full px-4 py-3 focus-within:bg-black focus-within:ring-1 focus-within:ring-[#1d9bf0] transition-all">
            <Search size={18} className="text-gray-500 mr-3" />
            <input type="text" placeholder="Search" aria-label="Search" className="bg-transparent border-none outline-none text-white w-full text-[15px] placeholder-gray-500" />
          </div>
        </div>

        <section className="bg-[#16181c] rounded-2xl p-3 mb-4">
          <h2 className="text-lg font-extrabold text-white mb-3 pb-2 border-b border-white/10 px-1">What's happening</h2>
          
          {isLoadingTrends ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-[#3b82f6]" size={24} />
            </div>
          ) : trendingTags.length > 0 ? (
            (showAllTrends ? trendingTags : trendingTags.slice(0, 3)).map((trend, index) => (
              <a href={`/search?q=%23${trend.tag}`} className="block py-2.5 hover:bg-gradient-to-r hover:from-white/[0.04] hover:to-transparent -mx-3 px-3 transition-colors group border-l-2 border-transparent hover:border-[#1d9bf0]" key={trend.tag}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#71767b] tracking-widest uppercase">
                        <TrendingUp size={12} className="text-[#1d9bf0]" />
                        {index + 1} · Trending
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-[16px] font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1d9bf0] group-hover:to-[#a855f7] transition-all truncate pr-3">
                        #{trend.tag}
                      </div>
                      <div className="text-[11px] font-bold text-[#1d9bf0] bg-[#1d9bf0]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {trend.score >= 1000 ? (trend.score / 1000).toFixed(1) + 'k' : trend.score} posts
                      </div>
                    </div>
                  </div>
                  <button className="text-[#71767b] hover:text-[#1d9bf0] opacity-0 group-hover:opacity-100 transition-opacity p-2 -mr-2 rounded-full hover:bg-[#1d9bf0]/10">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g></svg>
                  </button>
                </div>
              </a>
            ))
          ) : (
            <div className="text-gray-500 text-[15px] py-4 text-center">
              No trending hashtags right now.
            </div>
          )}
          {trendingTags.length > 3 && (
            <button 
              onClick={() => setShowAllTrends(!showAllTrends)}
              className="block w-full text-left mt-1 text-[#1d9bf0] hover:bg-white/5 text-[14px] py-2.5 -mx-3 px-4 rounded-b-2xl transition-colors"
            >
              {showAllTrends ? 'Show less' : 'Show more'}
            </button>
          )}
        </section>

        <section className="bg-[#16181c] rounded-2xl p-3 mb-4">
          <h2 className="text-lg font-extrabold text-white mb-3 pb-2 border-b border-white/10 px-1">Who to follow</h2>
          {suggestions.map((user) => (
            <div key={user.handle} className="flex items-center justify-between py-2.5 hover:bg-white/5 -mx-3 px-3 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar name={user.name} size="md" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-[#e7e9ea] text-[15px] hover:underline truncate">{user.name}</span>
                  <p className="text-[#71767b] text-[13px] truncate">@{user.handle}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="ml-2 shrink-0 rounded-full font-bold bg-white text-black hover:bg-gray-200">Follow</Button>
            </div>
          ))}
          <a href="#" className="block mt-1 text-[#1d9bf0] hover:bg-white/5 text-[14px] py-2.5 -mx-3 px-4 rounded-b-2xl transition-colors">Show more</a>
        </section>

        <footer className="sidebar-footer">
          <nav aria-label="Footer links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
            <a href="#">Accessibility</a>
            <a href="#">More</a>
          </nav>
          <p>&copy; 2026 Orbit.</p>
        </footer>
      </div>
    </aside>
  );
};

export default RightSidebar;

