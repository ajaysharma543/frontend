// Rightchat.jsx
import LogoutButton from '../authentication/logout';
import { useAuth } from '../context/context';
import { useEffect, useState } from 'react';
import Displaymessage from './displaymessage';
import socket from '../socket/socket.io';
import { useRef } from 'react';
import { UseTimeAgo } from '../context/gettimeago';
import Typing from './typing';
import Rightheader from './rightheader';
import Inputfooter from './inputfooter';
import Messageapi from '../api/message.api';

function MessageSkeleton() {
  const rows = [
    { mine: false, width: 'w-40' },
    { mine: true, width: 'w-52' },
    { mine: false, width: 'w-64' },
    { mine: false, width: 'w-28' },
    { mine: true, width: 'w-36' },
    { mine: true, width: 'w-48' },
  ];

  return (
    <div className="p-4 flex flex-col gap-3 animate-pulse">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex items-end gap-2 ${
            row.mine ? 'justify-end' : 'justify-start'
          }`}
        >
          {!row.mine && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          )}
          <div
            className={`h-9 ${row.width} rounded-2xl ${
              row.mine ? 'bg-gray-300' : 'bg-gray-200'
            }`}
          />
          {row.mine && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function Rightchat() {
  const { selectedchat, user } = useAuth();
  const [messages, setmessges] = useState([]);
  const bottomRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleDelete = ({ messageId }) => {
      setmessges((prev = []) =>
        prev.map((m) =>
          m._id?.toString() === messageId?.toString()
            ? {
                ...m,
                content: 'This message was deleted',
                image: null,
                isDeleted: true,
              }
            : m
        )
      );
    };

    socket.on('message_deleted', handleDelete);

    return () => socket.off('message_deleted', handleDelete);
  }, []);

  useEffect(() => {
    if (!selectedchat?._id) return;

    socket.emit('join_chat', selectedchat._id);

    return () => {
      socket.emit('leave_chat', selectedchat._id);
    };
  }, [selectedchat?._id]);

  useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}, [messages, isTyping]);

  useEffect(() => {
    if (!selectedchat?._id) return;

    const handleNewMessage = (newMsg) => {
      const chatId = newMsg.chat?._id || newMsg.chat;

      if (chatId?.toString() !== selectedchat?._id?.toString()) return;

      if (newMsg.sender?._id === user._id) return;

      setmessges((prev) => {
        const filtered = prev.filter(
          (m) =>
            !(
              m.isTemp &&
              m.content === newMsg.content &&
              m.sender?._id === newMsg.sender?._id
            )
        );
        const exists = filtered.some(
          (msg) => msg._id?.toString() === newMsg._id?.toString()
        );

        if (exists) return filtered;

        return [...filtered, newMsg];
      });

      if (newMsg.sender._id !== user._id) {
        Messageapi.markasread(selectedchat._id);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [selectedchat?._id, user?._id]);

  useEffect(() => {
    const handleRead = ({ chatId, userId }) => {
      if (chatId !== selectedchat?._id) return;

      setmessges((prev) => {
        let updated = false;

        const newMessages = prev.map((msg) => {
          const readby = msg.readby || [];

          const alreadyRead = readby.some(
            (u) => (u._id || u).toString() === userId.toString()
          );

          if (alreadyRead) return msg;
          updated = true;

          return {
            ...msg,
            readby: [...readby, userId],
            readAt: new Date(),
          };
        });

        return updated ? newMessages : prev;
      });
    };

    socket.on('messages_read', handleRead);

    return () => socket.off('messages_read', handleRead);
  }, [selectedchat]);

  useEffect(() => {
    if (selectedchat?._id && user?._id) {
      socket.emit('get_online_users');
    }
  }, [selectedchat?._id, user?._id]);

  useEffect(() => {
    if (!selectedchat?._id) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        setmessges([]);

        const response = await Messageapi.getmessage(selectedchat._id);
        if (!isMounted) return;

        const msgs = response?.data?.data?.messages;

        if (Array.isArray(msgs)) {
          setmessges(msgs);
        } else {
          setmessges([]);
        }
        Messageapi.markasread(selectedchat._id);
        setLoadingMessages(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedchat?._id]);

  if (!selectedchat || !selectedchat._id) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-3"></div>
    );
  }
  const otheruser = selectedchat?.members?.find(
    (item) => item?._id !== user?._id
  );

  return (
  <div className="h-full w-full flex-1 flex flex-col min-w-0">
    <div className="flex-shrink-0">
      <Rightheader />
    </div>

    <div className="flex-1 overflow-y-auto p-3 md:p-4">
      {loadingMessages ? (
        <MessageSkeleton />
      ) : (
        <Displaymessage
          messages={messages}
          bottomRef={bottomRef}
          setmessges={setmessges}
        />
      )}
      <Typing
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        otheruser={otheruser}
        typingTimeoutRef={typingTimeoutRef}
      />

      <div ref={bottomRef}></div>
    </div>

    <div className="flex-shrink-0">
      <Inputfooter
        setmessges={setmessges}
        typingTimeoutRef={typingTimeoutRef}
      />
    </div>
  </div>
  );
}

export default Rightchat;