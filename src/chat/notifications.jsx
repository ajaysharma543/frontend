import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/context';
import { Bell } from 'lucide-react';
import { GetTimeAgo } from '../context/gettimeago';
import socket from '../socket/socket.io';
import Messageapi from '../api/message.api';
import Chatapi from '../api/chat.api';

function Notifications() {
  const { chatUsers, setselectedchat, setChatUsers } = useAuth();
  const [open, setOpen] = useState(false);

  const totalUnread = useMemo(() => {
    return (chatUsers || []).reduce((acc, chat) => {
      return acc + (chat.unreadCount || 0);
    }, 0);
  }, [chatUsers]);

  const myId = JSON.parse(localStorage.getItem('user'))?._id;

  const notifications = (chatUsers || []).filter((chat) => {
    return (
      chat.lastMessage &&
      chat.lastMessage.sender?._id !== myId &&
      chat.unreadCount > 0
    );
  });

  const accesschat = async (item) => {
    try {
      let chat;
      let newItem = item;

      const isFromSearch = item.chatId === null;

      if (!item.isGroup || isFromSearch) {
        const res = await Chatapi.accesschat(item._id);
        chat = res.data.data;

        newItem = {
          ...item,
          isGroup: false,
          chatId: chat._id,
          lastMessage: chat.lastMessage || null,
          unreadCount: 0,
        };
      } else {
        chat = item;
      }
      
      setselectedchat(chat);

      socket.emit('join_chat', chat._id);

      await Messageapi.markasread(chat._id);

      setChatUsers((prev) => {
        const exists = prev.some((u) =>
          u.isGroup ? u._id === chat._id : u.chatId === chat._id
        );

        if (exists) {
          return prev.map((u) => {
            if (
              (u.isGroup && u._id === chat._id) ||
              (!u.isGroup && u.chatId === chat._id)
            ) {
              return {
                ...u,
                lastMessage: chat.lastMessage || u.lastMessage,
                unreadCount: 0,
              };
            }
            return u;
          });
        }

        return [
          {
            ...newItem,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      onClick={() => setOpen((prev) => !prev)}
      className="relative group cursor-pointer"
    >
      <div className="p-2 rounded-full bg-gray-100 hover:bg-orange-100 transition shadow-sm">
        <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
      </div>

      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
          {totalUnread}
        </span>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
              <h2 className="text-base font-semibold text-gray-700">
                Notifications
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-red-500 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="h-full flex items-center justify-center text-sm text-gray-400">
                  No messages yet
                </p>
              ) : (
                notifications.map((chat) => {
                  const isGroup = chat?.isGroup;
                  const senderName =
                    chat?.lastMessage?.sender?.fullname || 'User';

                  const displayName = isGroup
                    ? chat?.chatName || 'Group'
                    : chat?.fullname || 'User';

                  return (
                    <div
                      key={chat._id}
                      onClick={() => {
                        accesschat(chat);
                        setOpen(false);
                      }}
                      className="flex gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <img
                        src={
                          chat?.avatar?.url ||
                          'https://ui-avatars.com/api/?name=User'
                        }
                        alt="user"
                        className="w-9 h-9 border-y-yellow-950 border rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-gray-700 leading-snug">
                            <span className="font-semibold text-gray-800">
                              {displayName}
                            </span>{' '}
                            {chat?.lastMessage?.content
                              ? isGroup
                                ? `${senderName} sent a message`
                                : 'sent you a message'
                              : chat?.lastMessage?.image
                                ? isGroup
                                  ? `${senderName} sent an image 📷`
                                  : 'sent you an image 📷'
                                : isGroup
                                  ? `${senderName} sent something`
                                  : 'sent you something'}
                          </p>

                          <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                            {GetTimeAgo(chat?.lastMessage?.createdAt)}
                          </span>
                        </div>

                        {chat?.unreadCount > 0 && (
                          <p className="text-xs text-red-500 mt-1 font-medium">
                            {chat.unreadCount === 1
                              ? '1 new message'
                              : chat.unreadCount <= 4
                                ? `${chat.unreadCount} new messages`
                                : '4+ messages'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center py-2 border-t">
              <button className="text-sm text-blue-500 hover:underline">
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
