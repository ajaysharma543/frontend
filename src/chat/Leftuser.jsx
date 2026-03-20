import React from 'react'
import { useAuth } from '../context/context';
import { GetTimeAgo } from '../context/gettimeago';
import authapi from '../api/user.api';
import socket from '../socket/socket.io';

function Leftuser({users,setdata,setUsers}) {
  const {user,onlineUsers} = useAuth()
  const handleclick = async (clickedUser) => {
  try {
    const response = await authapi.accesschat(clickedUser._id);
    const chat = response.data.data;

    setdata(chat);
    socket.emit("join_chat", chat._id);

    const lastMessage = chat?.lastMessage;

    const isUnread =
      lastMessage &&
      lastMessage.sender?._id?.toString() !== user?._id?.toString() &&
      !lastMessage.readby?.some(
        id =>
          id?.toString?.() === user?._id?.toString() ||
          id?._id?.toString?.() === user?._id?.toString()
      );

    if (isUnread) {
      await authapi.markasread(chat._id);
    }

    setUsers(prev => {
      return prev.map(u => {
        if (
          u.chatId?.toString() === chat._id?.toString() ||
          u._id?.toString() === clickedUser._id?.toString()
        ) {
          const normalizedReadBy = (chat.lastMessage?.readby || []).map(id =>
            id?._id ? id._id.toString() : id.toString()
          );

          const updatedReadBy = [
            ...new Set([...normalizedReadBy, user._id.toString()])
          ];

          return {
            ...u,
            chatId: chat._id,
            unreadCount: 0,
            lastMessage: chat.lastMessage
              ? {
                  ...chat.lastMessage,
                  readby: updatedReadBy
                }
              : null
          };
        }
        return u;
      });

    });

  } catch (error) {
    console.log(error);
  }
};
  return (
   
  <div className="flex-1 overflow-y-auto">
  {users.map((item) => {
const latest = item?.lastMessage;
let messageText = "";
let messageColor = "text-gray-400 italic";

if (latest) {
  const senderId = latest?.sender?._id?.toString();
  const isMyMessage = senderId === user?._id?.toString();

  const unread = item.unreadCount || 0;

  if (!isMyMessage && unread > 1) {
    messageText = unread > 4 ? "4+ messages" : `${unread} new messages`;
  } else {
    const hasImage = latest?.image?.url;

    if (hasImage) {
      messageText = isMyMessage
        ? "You: Sent an image"
        : "Sent an image";
    } else {
      messageText = isMyMessage
        ? "You: " + latest.content
        : latest.content;
    }
  }

  const isRead = latest?.readby?.some(
    (id) =>
      id?.toString?.() === user?._id?.toString() ||
      id?._id?.toString?.() === user?._id?.toString()
  );

  if (senderId !== user?._id && !isRead) {
    messageColor = "text-black font-bold";
  } else {
    messageColor = "text-gray-500";
  }
}

    return (
    <div
    key={item._id}
    onClick={() => handleclick(item)}
    className="flex items-center gap-3 px-4 py-3 m-2 rounded-2xl bg-gray-200 cursor-pointer hover:bg-gray-300 transition"
    >

    <div className="relative">
   <img
  src={item.avatar?.url || "/default-avatar.png"}
  alt={item.fullname || "Unknown User"}
  className="w-12 h-12 rounded-full object-cover"
/>
{onlineUsers.has(item._id) && (
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
)}

    </div>

  <div className="flex-1">

<div className="flex justify-between items-center">
  <h2 className="font-semibold text-gray-800">
    {item.fullname || "Unknown User"}
  </h2>

  <div className="flex items-center gap-2">
    {latest?.createdAt && (
      <span className="text-xs text-gray-400">
        {GetTimeAgo(latest.createdAt)}
      </span>
    )}
    {item.unreadCount > 0 && (
      <div className="bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
        {item.unreadCount}
      </div>
    )}
  </div>
</div>

  <p className={`text-sm ${messageColor}`}>
    {messageText}
  </p>

</div>
    </div>
    );
    })}

      </div>
  )
}

export default Leftuser