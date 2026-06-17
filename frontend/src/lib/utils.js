import React from 'react';

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'now';

  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return 'now';

  const diff = Math.max(0, Date.now() - then);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'now';
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function renderContentWithHashtags(text) {
  if (!text) return null;

  return text.split(/(#\w+)/g).map((part, index) => {
    if (part.startsWith('#') && part.length > 1) {
      return React.createElement('span', { key: index, className: 'hashtag' }, part);
    }

    return React.createElement('span', { key: index }, part);
  });
}

export function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}/${path.replace(/\\/g, '/')}`;
};

export function normalizeMediaUrls(mediaUrl) {
  if (!mediaUrl) return [];

  const urls = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
  return urls.filter((url) => typeof url === 'string' && url.trim().length > 0);
}

export function getUserDisplay(user, fallback = {}) {
  const source = user && typeof user === 'object' ? user : fallback;
  const name = source.fullName || source.name || source.username || fallback.fullName || fallback.name || 'User';
  const username = source.username || fallback.username || 'user';

  return { name, username };
}

export function getLikedItems() {
  try {
    return JSON.parse(localStorage.getItem('orbit_likes') || '{}');
  } catch {
    return {};
  }
}

export function isLikedLocally(id) {
  if (!id) return false;
  return !!getLikedItems()[id];
}

export function toggleLikeLocally(id, isLiked) {
  if (!id) return;
  const likes = getLikedItems();
  if (isLiked) {
    likes[id] = true;
  } else {
    delete likes[id];
  }
  localStorage.setItem('orbit_likes', JSON.stringify(likes));
}
