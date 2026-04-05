import { useEffect, useState } from 'react';
import Leftuser from './Leftuser';
import Groupchat from './groupchat';
import { useAuth } from '../context/context';
import Chatapi from '../api/chat.api';
import socket from '../socket/socket.io';
import { useRef } from 'react';
import { SearchIcon } from 'lucide-react';

function Leftchat({ search, setsearch }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debounce, setdebounce] = useState('');
  const {
    user,
    allUsers,
    filteredUsers,
    setFilteredUsers,
    searchUsers,
    selectedchat,
    fetchUsers,
    setChatUsers,
    chatUsers,
  } = useAuth();
  const handlerRef = useRef();
  const selectedChatRef = useRef(selectedchat);
  const userRef = useRef(user);

  // console.log("first user",user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  
  useEffect(() => {
    if (!user?._id) return;
    const fetchchats = async () => {
      try {
        setLoading(true);

        const res = await Chatapi.fetchchat();
        const allChats = res.data.data;
        // console.log(allChats);

        const chatMap = new Map();

        allChats.forEach((c) => {
          const lastMsg = c.lastMessage || null;

          if (c.isGroup) {
            chatMap.set(c._id, {
              _id: c._id,
              isGroup: true,
              chatName: c.chatName,
              avatar: c.avatar,
              members: c.members,
              groupAdmin: c.groupAdmin,
              lastMessage: lastMsg,
              unreadCount: c.unreadCount || 0,
            });
          } else {
            const otherUser = c.members?.find((m) => m?._id !== user._id);
            if (otherUser) {
              chatMap.set(otherUser._id, {
                ...otherUser,
                isGroup: false,
                chatId: c._id,
                lastMessage: lastMsg,
                unreadCount: c.unreadCount || 0,
              });
            }
          }
        });

        const formatted = Array.from(chatMap.values());

        formatted.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt || 0;
          const timeB = b.lastMessage?.createdAt || 0;
          return new Date(timeB) - new Date(timeA);
        });
        setChatUsers(formatted);
        setFilteredUsers(formatted);

        allChats.forEach((c) => {
          socket.emit('join_chat', c._id);
        });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchchats();
  }, [user?._id, allUsers]);

  useEffect(() => {
    if (selectedchat?._id) {
      socket.emit('join_chat', selectedchat._id);
    }
  }, [selectedchat?._id]);

  useEffect(() => {
    socket.on('connect', () => {});
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit('join_user', user._id);
    }
  }, [user]);

  useEffect(() => {
    selectedChatRef.current = selectedchat;
  }, [selectedchat]);

  useEffect(() => {
    handlerRef.current = (newMsg) => {
      // console.log("second user",user);
      if (!userRef.current?._id) {
        console.log('Skipping message, user not ready');
        return;
      }

      const chatId = newMsg.chat?._id || newMsg.chat;
      const messageId = newMsg._id;

      setChatUsers((prev) => {
        let found = false;

        let updated = prev.map((chat) => {
          const isSameChat = chat.isGroup
            ? chat._id === chatId
            : chat.chatId === chatId;

          if (isSameChat) {
            found = true;

            const isSameMessage =
              chat.lastMessage?._id?.toString() === messageId?.toString();

            if (isSameMessage) return chat;

            const isCurrentChatOpen = selectedChatRef.current?._id === chatId;

            return {
              ...chat,
              lastMessage: newMsg,
              unreadCount: isCurrentChatOpen ? 0 : (chat.unreadCount || 0) + 1,
            };
          }

          return chat;
        });

        if (!found && newMsg.chat) {
          let newChatItem;

          if (newMsg.chat.isGroup) {
            newChatItem = {
              _id: newMsg.chat._id,
              isGroup: true,
              chatName: newMsg.chat.chatName,
              members: newMsg.chat.members,
              lastMessage: newMsg,
              unreadCount: 1,
            };
          } else {
            const otherUser = newMsg.chat.members?.find(
              (m) => m._id !== userRef.current?._id
            );

            newChatItem = {
              ...otherUser,
              isGroup: false,
              chatId: newMsg.chat._id,
              lastMessage: newMsg,
              unreadCount: 1,
            };
          }

          updated = [newChatItem, ...prev];
        }

        updated.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0)
        );

        setFilteredUsers(updated);
        return updated;
      });
    };
  }, [selectedchat?._id, user]);

  useEffect(() => {
    const listener = (msg) => {
      // console.log(" SOCKET MESSAGE RECEIVED:", msg);
      if (handlerRef.current) {
        handlerRef.current(msg);
      }
    };

    socket.on('new_message', listener);

    return () => {
      socket.off('new_message', listener);
    };
  }, []);

  useEffect(() => {
    const handleMessagesRead = ({ chatId, userId }) => {
      const updateFn = (prev) =>
        prev.map((chat) => {
          const isSameChat = chat.isGroup
            ? chat._id?.toString() === chatId?.toString()
            : chat.chatId?.toString() === chatId?.toString();

          if (!isSameChat || !chat.lastMessage) return chat;

          const normalizedReadBy = (chat.lastMessage.readby || []).map((id) =>
            id?._id ? id._id.toString() : id.toString()
          );

          const updatedReadBy = [
            ...new Set([...normalizedReadBy, userId.toString()]),
          ];

          return {
            ...chat,
            lastMessage: {
              ...chat.lastMessage,
              readby: updatedReadBy,
            },
          };
        });

      setChatUsers(updateFn);
      setFilteredUsers(updateFn);
    };

    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('messages_read', handleMessagesRead);
    };
  }, []);

  useEffect(() => {
    if (!debounce.trim()) return;

    fetchUsers(debounce);
  }, [debounce]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setdebounce(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!debounce.trim()) {
      setFilteredUsers(chatUsers);
      return;
    }

    const searchText = debounce.toLowerCase();

    const userResults = searchUsers.map((u) => {
      const existing = chatUsers.find((c) => !c.isGroup && c._id === u._id);

      return (
        existing || {
          ...u,
          isGroup: false,
          chatId: null,
          lastMessage: null,
        }
      );
    });

    const groupResults = chatUsers.filter(
      (c) => c.isGroup && c.chatName?.toLowerCase().includes(searchText)
    );

    const combined = [...groupResults, ...userResults];

    setFilteredUsers(combined);
  }, [searchUsers, chatUsers, debounce]);

  useEffect(() => {
    const handleGroupCreated = (group) => {
      const newItem = {
        _id: group._id,
        isGroup: true,
        chatName: group.chatName,
        members: group.members,
        lastMessage: null,
        groupAdmin: group.groupAdmin,
      };

      setChatUsers((prev) => {
        const exists = prev.some((c) => c._id === newItem._id);
        if (exists) return prev;

        return [newItem, ...prev];
      });

      setFilteredUsers((prev) => {
        const exists = prev.some((c) => c._id === newItem._id);
        if (exists) return prev;

        return [newItem, ...prev];
      });
    };

    socket.on('group_created', handleGroupCreated);

    return () => socket.off('group_created', handleGroupCreated);
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      <h1 className="p-4 text-lg font-semibold border-b">My Chats</h1>

      <Groupchat setFilteredUsers={setFilteredUsers} />

      <Leftuser
        setsearch={setsearch}
        setdebounce={setdebounce}
        filteredUsers={filteredUsers}
        setFilteredUsers={setFilteredUsers}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default Leftchat;
