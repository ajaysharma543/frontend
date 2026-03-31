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

function Rightchat() {
  const { selectedchat, user } = useAuth();
  const [messages, setmessges] = useState([]);
  const bottomRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('message_deleted', ({ messageId }) => {
      setmessges((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    return () => {
      socket.off('message_deleted');
    };
  }, []);

 useEffect(() => {
  if (!selectedchat?._id) return;

  socket.emit('join_chat', selectedchat._id);

  return () => {
    socket.emit('leave_chat', selectedchat._id);
  };
}, [selectedchat?._id]);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    socket.emit("get_online_users"); // 🔥 KEY FIX
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

        setmessges(response.data.data.messages);
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
      <div className="h-full flex items-center justify-center flex-col gap-3">
       
      </div>
    );
  }
  const otheruser = selectedchat?.members?.find(
    (item) => item?._id !== user?._id
  );

  return (
    <div className="h-full flex flex-col">
      <Rightheader />

      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <p className="text-center text-gray-400">Loading messages...</p>
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

      <Inputfooter
        setmessges={setmessges}
        typingTimeoutRef={typingTimeoutRef}
      />
    </div>
  );
}

export default Rightchat;