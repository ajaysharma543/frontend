import React from 'react';
import Chatapi from '../api/chat.api';
import { useAuth } from '../context/context';
import { GetTimeAgo } from '../context/gettimeago';
import socket from '../socket/socket.io';
import Messageapi from '../api/message.api';

function Leftuser({ setsearch, setdebounce, loading, error }) {
  const {
    setselectedchat,
    setFilteredUsers,
    filteredUsers,
    setChatUsers,
    selectedchat,
    onlineUsers,
    user,
  } = useAuth();

  const accesschat = async (item) => {
    try {
      const isFromSearch = item.chatId === null;

      if (item.isGroup && !isFromSearch) {
        setselectedchat(item);
        setsearch('');
        setdebounce('');

        socket.emit('join_chat', item._id);

        await Messageapi.markasread(item._id);

        return;
      }

      const tempChat = {
        _id: item.chatId || 'temp-' + item._id,
        isGroup: false,
        members: [item],
        chatName: item.fullname,
        avatar: item.avatar,
        lastMessage: null,
      };

      setselectedchat(tempChat);

      setsearch('');
      setdebounce('');

      socket.emit('join_chat', tempChat._id);

      const res = await Chatapi.accesschat(item._id);
      const chat = res.data.data;

      setselectedchat(chat);

      socket.emit('join_chat', chat._id);

      await Messageapi.markasread(chat._id);

      const newItem = {
        ...item,
        isGroup: false,
        chatId: chat._id,
        lastMessage: chat.lastMessage || null,
        unreadCount: 0,
        groupAdmin: chat.groupAdmin,
      };

      setChatUsers((prev) => {
        const exists = prev.some((u) =>
          u.isGroup ? u._id === chat._id : u.chatId === chat._id
        );

        if (exists) {
          return prev.map((u) =>
            (u.isGroup && u._id === chat._id) ||
            (!u.isGroup && u.chatId === chat._id)
              ? {
                  ...u,
                  lastMessage: chat.lastMessage || u.lastMessage,
                  unreadCount: 0,
                }
              : u
          );
        }

        return [{ ...newItem, unreadCount: 0 }, ...prev];
      });

      setFilteredUsers((prev) => {
        const exists = prev.some((u) =>
          u.isGroup ? u._id === chat._id : u.chatId === chat._id
        );

        if (exists) {
          return prev.map((u) =>
            (u.isGroup && u._id === chat._id) ||
            (!u.isGroup && u.chatId === chat._id)
              ? {
                  ...u,
                  lastMessage: chat.lastMessage || u.lastMessage,
                  unreadCount: 0,
                }
              : u
          );
        }

        return [{ ...newItem, unreadCount: 0 }, ...prev];
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  if (filteredUsers.length === 0) {
    return <p className="p-4 text-gray-400 text-center">No users found</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredUsers.map((item) => {
        const isActive =
          selectedchat?._id?.toString() ===
          (item.isGroup ? item._id?.toString() : item.chatId?.toString());

        const latest = item.lastMessage;

        let messageText = '';
        let messageColor = 'text-gray-400 italic';

        if (latest) {
          const senderId =
            latest?.sender?._id?.toString() || latest?.sender?.toString();

          const myId = user?._id?.toString();
          const isMyMessage = senderId === myId;

          const isCurrentChatOpen =
            selectedchat?._id?.toString() ===
            (item.isGroup ? item._id?.toString() : item.chatId?.toString());

          const hasImage = latest?.image?.url;
          const unread = Math.max(0, item.unreadCount || 0);

          if (latest.isDeleted) {
            messageText = isMyMessage
              ? 'You deleted a message'
              : 'This message was deleted';

            messageColor = 'text-black italic';
          } else if (!latest.content && !hasImage) {
            messageText = 'No messages';
            messageColor = 'text-gray-400 italic';
          } else if (!isMyMessage && unread > 0 && !isCurrentChatOpen) {
            if (unread > 4) {
              messageText = '4+ new messages';
            } else if (unread > 1) {
              messageText = `${unread} new messages`;
            } else {
              messageText = hasImage ? 'Sent an image' : latest.content;
            }

            messageColor = 'text-black font-bold';
          } else {
            if (hasImage) {
              messageText = isMyMessage
                ? 'You: Sent an image'
                : 'Sent an image';
            } else {
              messageText = isMyMessage
                ? `You: ${latest.content}`
                : latest.content;
            }

            messageColor = isMyMessage ? 'text-gray-500' : 'text-gray-400';
          }
        }
        return (
          <div
            key={item.isGroup ? item._id : item.chatId}
            onClick={() => accesschat(item)}
            className={`flex items-center gap-3 px-4 py-3 m-2 rounded-2xl cursor-pointer transition
  ${
    isActive
      ? 'bg-orange-100 border border-orange-400 shadow-sm'
      : 'bg-gray-200 hover:bg-gray-300'
  }`}
          >
            {' '}
            <div className="relative flex-shrink-0">
              {item.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  {item.chatName?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={item.avatar?.url || '/default-avatar.png'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              {!item.isGroup && onlineUsers.has(item._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
           <div className="flex justify-between items-center">
  <h1 className="font-medium truncate">
    {item.isGroup ? item.chatName : item.fullname}
  </h1>

  <div className="flex flex-col items-end gap-1">
    {latest?.createdAt && (
      <span className="text-xs text-gray-400">
        {GetTimeAgo(latest.createdAt)}
      </span>
    )}

    {item.unreadCount > 0 && !isActive && (
      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
        {item.unreadCount > 4 ? '4+' : item.unreadCount}
      </span>
    )}
  </div>
</div>
              <p className={`text-sm ${messageColor}`}>{messageText}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Leftuser;
