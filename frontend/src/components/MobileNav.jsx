import { Home, Search, Feather, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

import { getImageUrl } from '../lib/utils';
import Avatar from './ui/Avatar';
import { useNotification } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const MobileNav = ({ onPostClick, userProfile }) => {
  const location = useLocation();
  const { unreadCount, isDropdownOpen, toggleDropdown } = useNotification();

  return (
    <>
      <motion.button 
        className="mobile-fab"
        type="button"
        onClick={onPostClick}
        whileTap={{ scale: 0.9 }}
        aria-label="Create post"
      >
        <Feather size={24} />
      </motion.button>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`} aria-label="Home">
          <Home size={24} />
        </Link>
        <Link to="/explore" className={`mobile-nav-item ${location.pathname === '/explore' ? 'active' : ''}`} aria-label="Search">
          <Search size={24} />
        </Link>
        <button 
          onClick={(e) => { e.preventDefault(); toggleDropdown(); }} 
          className={`mobile-nav-item relative notification-toggle-btn ${isDropdownOpen ? 'active' : ''}`} 
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-[10px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 border border-black">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </button>
        <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`} aria-label="Profile">
          {userProfile?.avatar ? (
            <Avatar size="sm" src={getImageUrl(userProfile.avatar)} name={userProfile.name || userProfile.username} />
          ) : (
            <User size={24} />
          )}
        </Link>
      </nav>
    </>
  );
};

export default MobileNav;
