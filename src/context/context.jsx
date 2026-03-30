
import { createContext, useContext, useEffect, useState } from 'react';
import authapi from '../api/user.api';
import socket from '../socket/socket.io';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
 const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
  });
  const [selectedchat, setselectedchat] = useState(); 
  const [allUsers, setAllUsers] = useState([]);
const [searchUsers, setSearchUsers] = useState([]); 
 const [chat, setchat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  const navigate = useNavigate()

const getUser = async () => {
  try {
    const res = await authapi.getcurrentuser();

    if (res?.data?.data) {
      setUser(res.data.data.user);

      localStorage.setItem("user", JSON.stringify(res.data.data.user));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  } catch (err) {
    console.log(err);
    setUser(null);
    localStorage.removeItem("user");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getUser();
  }, []);

useEffect(() => {
  if (!loading && user === null) {
    navigate('/login', { replace: true });
  }
}, [user, loading]);

  const getAllUsers = async () => {
  try {
    const res = await authapi.getsearchuser("");
    setAllUsers(res.data.data.users);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  getAllUsers();
}, []);

const fetchUsers = async (search = "") => {
  try {
    const res = await authapi.getsearchuser(search);
setSearchUsers(res.data.data.users);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  socket.on("all_online_users", (users) => {
    const updated = new Set(users.map(id => id.toString()));
    setOnlineUsers(updated);
  });

  return () => socket.off("all_online_users");
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
  fetchUsers,
   searchUsers,
  selectedchat,
  setselectedchat,
  onlineUsers,
  lastSeenMap,
  loading, 
}}
    >
{loading ? <div></div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
