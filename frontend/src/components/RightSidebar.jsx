import { Search } from 'lucide-react';
import { PiFlowerLotusDuotone } from 'react-icons/pi';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const trends = [
  { category: 'Design - Trending', title: '#BlackInterface', stats: '12.8K posts' },
  { category: 'Frontend studios', title: 'Motion craft', stats: '8,234 posts' },
  { category: 'Social UX', title: 'Readable timelines', stats: '4,109 posts' },
];

const suggestions = [
  { name: 'Linear', handle: 'linear' },
  { name: 'Vercel', handle: 'vercel' },
  { name: 'Cloudinary', handle: 'cloudinary' },
];

const RightSidebar = () => {
  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-inner">
        <div className="sticky top-0 bg-[#030305]/80 backdrop-blur-md pt-2 pb-4 z-10">
          <div className="flex items-center bg-[#202327] rounded-full px-4 py-3 focus-within:bg-[#030305] focus-within:ring-1 focus-within:ring-[#3b82f6] transition-all">
            <Search size={18} className="text-gray-500 mr-3" />
            <input type="text" placeholder="Search Orbit" aria-label="Search Orbit" className="bg-transparent border-none outline-none text-white w-full text-[15px] placeholder-gray-500" />
          </div>
        </div>





        <section className="bg-[rgba(15,15,18,0.4)] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-extrabold text-white mb-4">What's happening</h2>
          {trends.map((trend) => (
            <a href="#" className="block py-3 hover:bg-white/5 -mx-5 px-5 transition-colors group" key={trend.title}>
              <div className="text-[13px] text-gray-500 mb-0.5">{trend.category}</div>
              <div className="text-[16px] font-bold text-white group-hover:text-[#3b82f6] transition-colors">{trend.title}</div>
              <div className="text-[13px] text-gray-500 mt-0.5">{trend.stats}</div>
            </a>
          ))}
          <a href="#" className="block mt-2 text-[#3b82f6] hover:underline text-[15px] pt-3 -mx-5 px-5 border-t border-white/5">Show more</a>
        </section>

        <section className="bg-[rgba(15,15,18,0.4)] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-extrabold text-white mb-4">Who to follow</h2>
          {suggestions.map((user) => (
            <div key={user.handle} className="flex items-center justify-between py-3 hover:bg-white/5 -mx-5 px-5 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar name={user.name} size="md" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-white text-[15px] hover:underline truncate">{user.name}</span>
                  <p className="text-gray-500 text-[14px] truncate">@{user.handle}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="ml-3 shrink-0 rounded-full font-bold bg-white text-black hover:bg-gray-200">Follow</Button>
            </div>
          ))}
          <a href="#" className="block mt-2 text-[#3b82f6] hover:underline text-[15px] pt-3 -mx-5 px-5 border-t border-white/5">Show more</a>
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
