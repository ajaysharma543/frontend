import { createContext, useContext, useEffect, useState } from 'react';
import authapi from '../api/user.api';
import socket from '../socket/socket.io';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedchat, setselectedchat] = useState(null);
  const [chat, setchat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});

  const getUser = async () => {
    try {
      const res = await authapi.getcurrentuser();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await authapi.getallusers();
        setAllUsers(res.data.data.users);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    socket.on('user_online', (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.add(userId);
        return updated;
      });
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });

      setLastSeenMap((prev) => ({
        ...prev,
        [userId]: lastSeen,
      }));
    });

    return () => {
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit('join_user', user._id);
    }
  }, [user]);

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

    socket.emit('join_user', user._id);
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      socket.emit('join_user', user._id);

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
    <AuthContext.Provider
      value={{
        allUsers,
        setAllUsers,
        user,
        setUser,
        chat,
        setchat,
        selectedchat,
        setselectedchat,
        onlineUsers,
        lastSeenMap,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
