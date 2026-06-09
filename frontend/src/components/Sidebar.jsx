import { Home, User, Bell, Mail, Hash, Feather, MoreHorizontal, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OrbitLogo from './ui/OrbitLogo';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { getImageUrl } from '../lib/utils';
import { useNotification } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Explore', icon: Hash, path: '/explore' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Messages', icon: Mail, path: '/messages' },
  { label: 'Profile', icon: User, path: '/profile' },
];

const Sidebar = ({ userProfile, onLogout, onPostClick }) => {
  const displayName = userProfile?.fullName || userProfile?.name || userProfile?.username || 'Orbit user';
  const username = userProfile?.username || 'user';
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { unreadCount, isDropdownOpen, toggleDropdown } = useNotification();

  return (
    <header className="sidebar">
      <div className="sidebar-inner">
        <Link to="/">
          <motion.div
            className="brand-logo-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Orbit home"
          >
            <div className="brand-logo">
              <OrbitLogo size={32} />
            </div>
            <span className="brand-wordmark">Orbit</span>
          </motion.div>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            const isNotifications = label === 'Notifications';

            if (isNotifications) {
              return (
                <div key={label} className="relative">
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleDropdown(); }} 
                    className={`nav-item w-full notification-toggle-btn ${isDropdownOpen ? 'active' : ''}`}
                  >
                    <div className="relative">
                      <Icon size={26} className="nav-icon" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-[11px] font-bold h-5 min-w-[20px] flex items-center justify-center rounded-full px-1 border-2 border-black">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                    <span className="nav-text">{label}</span>
                  </button>
                </div>
              );
            }

            return (
              <Link to={path} className={`nav-item ${active ? 'active' : ''}`} key={label}>
                <div className="relative">
                  <Icon size={26} className="nav-icon" />
                </div>
                <span className="nav-text">{label}</span>
              </Link>
            );
          })}
        </nav>

        <Button className="tweet-btn-lg" fullWidth size="lg" onClick={onPostClick}>
          <span className="tweet-btn-text">Post</span>
          <Feather className="tweet-btn-icon" size={24} />
        </Button>

        {userProfile && (
          <div className="user-profile-menu">
            <button 
              className="user-profile-btn" 
              type="button" 
              onClick={() => setShowDropdown(!showDropdown)} 
              aria-label={`Menu for ${username}`}
            >
              <Avatar name={displayName} src={getImageUrl(userProfile.avatar)} size="md" />
              <div className="user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-handle">@{username}</div>
              </div>
              <MoreHorizontal size={20} className="more-icon" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 mb-3 w-full bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)] z-50 py-2"
                >
                  <div className="px-4 py-3 border-b border-white/10 mb-1">
                    <div className="font-bold text-[15px] truncate">{displayName}</div>
                    <div className="text-gray-500 text-[14px] truncate">@{username}</div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold hover:bg-white/5 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={20} />
                    View Profile
                  </Link>
                  
                  <Link 
                    to="/setup" 
                    className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold hover:bg-white/5 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings size={20} />
                    Settings & Profile
                  </Link>
                  
                  <div className="h-[1px] bg-white/10 my-1 mx-2" />
                  
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3.5 text-[15px] font-bold hover:bg-red-500/10 hover:text-red-500 text-white transition-colors"
                  >
                    <LogOut size={20} />
                    Log out @{username}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};

export default Sidebar;
