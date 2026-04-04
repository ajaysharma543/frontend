import { createContext, useContext, useEffect, useState } from 'react';
import authapi from '../api/user.api';
import socket from '../socket/socket.io';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [chatUsers, setChatUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [onlineLoaded, setOnlineLoaded] = useState(false);
  const [selectedchat, setselectedchat] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [chat, setchat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  // const [notifications, setNotifications] = useState(() => {
  //   const stored = localStorage.getItem("notifications");
  //   return stored ? JSON.parse(stored) : [];
  // });
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const res = await authapi.getcurrentuser();

      const updatedUser = res?.data?.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.log(err);
      setUser(null);
      localStorage.removeItem('user');
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
      const res = await authapi.getsearchuser('');
      setAllUsers(res.data.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    try {
      const res = await authapi.getsearchuser(search);
      setSearchUsers(res.data.data.users);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      if (user?._id) {
        socket.emit('join_user', user._id);
        socket.emit('get_online_users');
      }
    });

    return () => socket.off('connect');
  }, [user]);

  useEffect(() => {
    const handleRename = (updatedChat) => {
      setselectedchat((prev) =>
        prev?._id === updatedChat._id ? { ...prev, ...updatedChat } : prev
      );

      const updateFn = (prev) =>
        prev.map((chat) => {
          if (chat._id !== updatedChat._id) return chat;

          return {
            ...chat,
            chatName: updatedChat.chatName,

            lastMessage: updatedChat.lastMessage || chat.lastMessage,

            members: updatedChat.members || chat.members,
            groupAdmin: updatedChat.groupAdmin || chat.groupAdmin,
          };
        });

      setChatUsers(updateFn);
      setFilteredUsers(updateFn);
    };

    socket.on('group_renamed', handleRename);

    return () => socket.off('group_renamed', handleRename);
  }, []);

  useEffect(() => {
    socket.on('kicked_from_group', ({ chatId, userId }) => {
      setselectedchat((prev) => {
        if (!prev || prev._id !== chatId) return prev;

        return {
          ...prev,
          members: prev.members.filter((member) => member._id !== userId),
        };
      });
    });

    socket.on('removed_from_group', ({ chatId }) => {
      setselectedchat(null);

      setChatUsers((prev) => prev.filter((chat) => chat._id !== chatId));
    });

    return () => {
      socket.off('kicked_from_group');
      socket.off('removed_from_group');
    };
  }, []);

  useEffect(() => {
    const handleDelete = ({
      chatId,
      lastMessage,
      wasUnread,
      isLastMessageDeleted,
    }) => {
      setselectedchat((prev) => {
        if (!prev || prev._id?.toString() !== chatId?.toString()) return prev;

        return {
          ...prev,
          lastMessage: lastMessage ?? prev.lastMessage,
        };
      });

      const updateFn = (prev = []) =>
        prev.map((chat) => {
          const isSameChat = chat.isGroup
            ? chat._id?.toString() === chatId?.toString()
            : chat.chatId?.toString() === chatId?.toString();

          if (!isSameChat) return chat;

          let newUnread = Math.max(0, chat.unreadCount || 0);

          if (wasUnread) {
            newUnread = Math.max(0, newUnread - 1);
          }

          if (isLastMessageDeleted) {
            return {
              ...chat,
              lastMessage: lastMessage,
              unreadCount: newUnread,
            };
          }

          if (
            newUnread === chat.unreadCount &&
            lastMessage === undefined &&
            !isLastMessageDeleted
          ) {
            return chat;
          }

          return {
            ...chat,
            lastMessage:
              lastMessage !== undefined ? lastMessage : chat.lastMessage,
            unreadCount: newUnread,
          };
        });

      setChatUsers(updateFn);
      setFilteredUsers(updateFn);
    };

    socket.on('message_deleted', handleDelete);

    return () => socket.off('message_deleted', handleDelete);
  }, []);

  useEffect(() => {
    socket.on('added_to_group', (chat) => {
      setChatUsers((prev) => {
        const exists = prev.find((c) => c._id === chat._id);
        if (exists) return prev;
        return [...prev, chat];
      });
    });

    return () => socket.off('added_to_group');
  }, []);

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
    <AuthContext.Provider
      value={{
        allUsers,
        setAllUsers,
        user,
        setUser,
        chat,
        setchat,
        fetchUsers,
        // notifications,
        // setNotifications,
        chatUsers,
        setChatUsers,
        searchUsers,
        selectedchat,
        setselectedchat,
        setFilteredUsers,
        filteredUsers,
        onlineLoaded,
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
