import { useEffect, useState } from "react";
import authapi from "../api/user.api";
import { useAuth } from "../context/context";
import socket from "../socket/socket.io";
import { GetTimeAgo } from "../context/gettimeago";
import Leftuser from "./Leftuser";

function Leftchat({ search,setdata,data }) {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user} = useAuth();
const [, forceUpdate] = useState(0);

useEffect(() => {
  const getUsers = async () => {
    try {
      const usersRes = await authapi.getallusers();
      const chatsRes = await authapi.fetchchat();

      const users = usersRes.data.data.users;
      const chats = chatsRes.data.data;

      const chatMap = new Map();
      chats.forEach((c) => {
        c.members?.forEach((m) => {
          if (m?._id !== user?._id) {
            chatMap.set(m._id, c);
          }
        });
      });

      const formatted = users
        .filter((u) => u._id !== user?._id)
        .map((u) => {
          const chat = chatMap.get(u._id);

          return {
            ...u,
            chatId: chat?._id || null,
            lastMessage: chat?.lastMessage || null,
            unreadCount: chat?.unreadCount || 0,
          };
        });

      formatted.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || 0;
        const timeB = b.lastMessage?.createdAt || 0;
        return new Date(timeB) - new Date(timeA);
      });

      setUsers(formatted);
      setAllUsers(formatted);

      chats.forEach((c) => {
        socket.emit("join_chat", c._id);
      });

    } catch (error) {
      console.log(error);
    }
  };

  getUsers();
}, [user]);

useEffect(() => {
  socket.on("connect", () => {});
}, []);


useEffect(() => {
  if(user?._id){
    socket.emit("join_user", user._id);
  }
}, [user]);

useEffect(() => {
const handler = async (message) => {
  setUsers(prev => {
    let found = false;

    const updated = prev.map(u => {
      if (message.chat?._id?.toString() === u.chatId?.toString()) {
        found = true;

        const isRead = message.readby?.some(
          id =>
            id?.toString?.() === user?._id?.toString() ||
            id?._id?.toString?.() === user?._id?.toString()
        );

        const isCurrentChat =
          data?._id?.toString() === u.chatId?.toString();

        let newUnreadCount = u.unreadCount || 0;

        if (isCurrentChat) {
          newUnreadCount = 0;
        } else if (
          message.sender?._id?.toString() !== user?._id?.toString() &&
          !isRead
        ) {
          newUnreadCount += 1;
        }

        return {
          ...u,
          chatId: message.chat._id, 
          lastMessage: message,
          unreadCount: newUnreadCount,
        };
      }

      return u;
    });

const finalList = found ? updated : (() => {
  const otherUser = message.chat.members.find(
    m => m._id.toString() !== user._id.toString()
  );

  if (otherUser) {
    const filtered = updated.filter(
      u => u._id.toString() !== otherUser._id.toString()
    );

    filtered.unshift({
      ...otherUser,
      chatId: message.chat._id,
      lastMessage: message,
      unreadCount:
        message.sender._id.toString() === user._id.toString()
          ? 0
          : 1,
    });

    return filtered;
  }

  return updated;
})();

finalList.sort((a, b) => {
  const timeA = a.lastMessage?.createdAt || 0;
  const timeB = b.lastMessage?.createdAt || 0;
  return new Date(timeB) - new Date(timeA);
});

return finalList;

  });

  if (data?._id === message.chat._id) {
    await authapi.markasread(message.chat._id);
  }
};

  socket.on("new_message", handler);

  return () => socket.off("new_message", handler);
}, [data?._id, user]);

useEffect(() => {
  if(data?._id){
     socket.emit("join_chat", data._id);
  }
}, [data?._id]);

useEffect(() => {
  const handler = ({ chatId, userId }) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.chatId?.toString() !== chatId?.toString() || !u.lastMessage) {
          return u;
        }

        const senderId = u.lastMessage?.sender?._id?.toString();
        const isMyMessage = senderId === user?._id?.toString();

        const normalizedReadBy = (u.lastMessage?.readby || []).map(id =>
          id?._id ? id._id.toString() : id.toString()
        );

        const updatedReadBy = [
          ...new Set([...normalizedReadBy, userId.toString()])
        ];

        const isReaderNotMe = userId.toString() !== user?._id?.toString();

        let newUnread = u.unreadCount || 0;

        if (isMyMessage && isReaderNotMe) {
          newUnread = Math.max(newUnread - 1, 0);
        }

        return {
          ...u,
          lastMessage: {
            ...u.lastMessage,
            readby: updatedReadBy
          },
          unreadCount: newUnread
        };
      })
    );
  };

  socket.on("messages_read", handler);

  return () => socket.off("messages_read", handler);
}, [user]);

useEffect(() => {
  const interval = setInterval(() => {
    forceUpdate(n => n + 1);
  }, 60000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

useEffect(() => {
  if (!debouncedSearch) {
    setUsers(prev => (prev === allUsers ? prev : allUsers));
    return;
  }

  const search = debouncedSearch.toLowerCase();

  const filtered = allUsers.filter((u) =>
    u.fullname?.toLowerCase().includes(search)
  );

  setUsers(filtered);
}, [debouncedSearch, allUsers]);


  return (
  <div className="h-full flex flex-col bg-white">
  <h1 className="p-4 text-lg font-semibold border-b">
    My Chats
  </h1>
  <button className="mx-4 my-3 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition">
    + New Group Chat
  </button>
    <Leftuser users={users} setUsers={setUsers} setdata={setdata}/>
  </div>
      );
    }

    export default Leftchat;