// ChatContext.jsx
import { useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import socket from '../socket/socket.io';
import { useAuth } from './context';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [onlineLoaded, setOnlineLoaded] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  const  { user} = useAuth();
  
  useEffect(() => {
    socket.on('all_online_users', (users) => {
      const updated = new Set(users.map((id) => id.toString()));
      setOnlineUsers(updated);
      setOnlineLoaded(true);
    });

    return () => socket.off('all_online_users');
  }, []);

  useEffect(() => {
    socket.on('user_online', (userId) => {
      const id = userId.toString();

      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.add(id);
        return updated;
      });
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      const id = userId.toString();

      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });

      setLastSeenMap((prev) => ({
        ...prev,
        [id]: lastSeen,
      }));
    });

    return () => {
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const handleVisibility = () => {
      if (document.hidden) {
        socket.emit('inactive', user._id);
      } else {
        socket.emit('join_user', user._id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(
        () => {
          socket.emit('inactive', user._id);
        },
        10 * 60 * 1000
      );
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [user]);
  return (
    <ChatContext.Provider value={{
       onlineLoaded,
       onlineUsers,
       lastSeenMap,
        }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
