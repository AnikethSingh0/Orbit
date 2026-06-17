import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import { updateProfile, fetchProfile } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import Avatar from '../components/ui/Avatar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

// Helper to normalize backend paths for images
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}/${path.replace(/\\/g, '/')}`;
};

const Setup = ({ userProfile: jwtProfile }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    username: jwtProfile?.username || '',
    fullName: jwtProfile?.fullName || jwtProfile?.name || '',
    bio: '',
    location: '',
    website: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (!jwtProfile?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { res, data } = await fetchProfile(jwtProfile.id);
        if (isMounted && res.ok && data.status === 'success' && data.data) {
          const profile = data.data;
          setFormData({
            username: profile.username || jwtProfile?.username || '',
            fullName: profile.fullName || jwtProfile?.name || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: '', // UI only
          });
          
          if (profile.avatar) setAvatarPreview(getImageUrl(profile.avatar));
          if (profile.banner) setBannerPreview(getImageUrl(profile.banner));
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [jwtProfile]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('fullName', formData.fullName);
      data.append('bio', formData.bio);
      data.append('location', formData.location);
      
      if (avatarFile) data.append('avatar', avatarFile);
      if (bannerFile) data.append('banner', bannerFile);
      
      const { res, data: resData } = await updateProfile(data);
      if (res.ok && resData.status === 'success') {
        addToast('Profile updated successfully', 'success');
        navigate('/profile');
      } else {
        addToast(resData?.message || 'Error updating profile', 'error');
      }
    } catch (error) {
      addToast('An error occurred during update', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="feed overflow-y-auto h-screen custom-scrollbar pb-20">
        <div className="p-4"><LoadingSkeleton count={2} /></div>
      </div>
    );
  }

  return (
    <div className="feed overflow-y-auto h-screen custom-scrollbar pb-20">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Edit profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
        <div className="relative mb-16">
          <div 
            className="h-48 w-full bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => bannerInputRef.current?.click()}
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center justify-center">
                <Camera size={32} className="text-white/50" />
              </div>
            )}
            <div className="absolute inset-0 h-48 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={bannerInputRef} 
              onChange={(e) => handleFileChange(e, 'banner')} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div 
            className="absolute -bottom-12 left-4 rounded-full border-4 border-black bg-black p-1 cursor-pointer group/avatar z-20"
            onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <Avatar name={formData.fullName || formData.username || 'User'} size="lg" className="w-24 h-24 text-2xl" />
            )}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <div className="p-2 bg-black/50 rounded-full backdrop-blur-sm">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={avatarInputRef} 
              onChange={(e) => handleFileChange(e, 'avatar')} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <div className="floating-input-group">
            <input 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder=" " 
              className="w-full bg-transparent border border-white/20 rounded-lg p-4 pt-6 text-white focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all"
            />
            <label className="absolute top-4 left-4 text-gray-500 transition-all pointer-events-none text-sm peer-focus:-translate-y-3 peer-focus:text-xs">Name</label>
          </div>
          
          <div className="floating-input-group">
            <input 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder=" " 
              required
              className="w-full bg-transparent border border-white/20 rounded-lg p-4 pt-6 text-white focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all"
            />
            <label className="absolute top-4 left-4 text-gray-500 transition-all pointer-events-none text-sm peer-focus:-translate-y-3 peer-focus:text-xs">Username</label>
          </div>
          
          <div className="floating-input-group">
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder=" " 
              rows={3}
              className="w-full bg-transparent border border-white/20 rounded-lg p-4 pt-6 text-white focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all resize-none"
            />
            <label className="absolute top-4 left-4 text-gray-500 transition-all pointer-events-none text-sm peer-focus:-translate-y-3 peer-focus:text-xs">Bio</label>
          </div>
          
          <div className="floating-input-group">
            <input 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder=" " 
              className="w-full bg-transparent border border-white/20 rounded-lg p-4 pt-6 text-white focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all"
            />
            <label className="absolute top-4 left-4 text-gray-500 transition-all pointer-events-none text-sm peer-focus:-translate-y-3 peer-focus:text-xs">Location</label>
          </div>
          
          <div className="floating-input-group">
            <input 
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              placeholder=" " 
              className="w-full bg-transparent border border-white/20 rounded-lg p-4 pt-6 text-white focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] outline-none transition-all"
            />
            <label className="absolute top-4 left-4 text-gray-500 transition-all pointer-events-none text-sm peer-focus:-translate-y-3 peer-focus:text-xs">Website (Preview Only)</label>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Setup;
