import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { getToken, setToken, removeToken } from './lib/api';
import { parseJwt } from './lib/utils';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Setup from './pages/Setup';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

const AppContent = () => {
  const [token, setTokenState] = useState(getToken());
  const [userProfile, setUserProfile] = useState(token ? parseJwt(token) : null);
  const { addToast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setTokenState(urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, "/");
      addToast('Logged in with Google', 'success');
    }
  }, [addToast]);

  useEffect(() => {
    if (token) {
      const jwtData = parseJwt(token);
      if (jwtData?.id) {
        import('./lib/api').then(({ fetchProfile }) => {
          fetchProfile(jwtData.id).then(({ res, data }) => {
            if (res.ok && data.status === 'success' && data.data) {
              setUserProfile({ ...jwtData, ...data.data.user });
            } else {
              setUserProfile(jwtData);
            }
          }).catch(() => setUserProfile(jwtData));
        });
      } else {
        setUserProfile(jwtData);
      }
    } else {
      setUserProfile(null);
    }
  }, [token]);

  const handleLogout = () => {
    removeToken();
    setTokenState(null);
    addToast('Logged out successfully', 'success');
  };

  const handleLogin = (newToken, msg) => {
    setTokenState(newToken);
    setToken(newToken);
    addToast(msg || 'Authentication successful', 'success');
  };

  const scrollToComposer = () => {
    document.querySelector('.post-composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!token) {
    return <Landing onLogin={handleLogin} />;
  }

  return (
    <NotificationProvider userProfile={userProfile}>
      <div className="fixed inset-0 z-[-1] bg-[#030305]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030305] to-[#030305]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#030305] to-[#030305]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20" />
      </div>
      <Routes>
        <Route path="/" element={<Layout userProfile={userProfile} onLogout={handleLogout} scrollToComposer={scrollToComposer} />}>
          <Route index element={<Home token={token} userProfile={userProfile} />} />
          <Route path="setup" element={<Setup userProfile={userProfile} />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile userProfile={userProfile} />} />
          <Route path="profile/:userId" element={<Profile userProfile={userProfile} />} />
          <Route path="messages" element={<Messages userProfile={userProfile} />} />
          <Route path="messages/:userId" element={<Messages userProfile={userProfile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
