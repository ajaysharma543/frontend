import React, { useEffect } from 'react';
import socket from '../socket/socket.io';
import { useAuth } from '../context/context';

function Typing({ otheruser, isTyping, setIsTyping, typingTimeoutRef }) {
  const { user, selectedchat } = useAuth();

  // console.log(otheruser);

  useEffect(() => {
    if (!selectedchat?._id) return;

    socket.emit('join_chat', selectedchat._id);
  }, [selectedchat]);

  useEffect(() => {
    if (!selectedchat?._id) return;

    const handleTyping = ({ chatId, userId }) => {
      if (chatId !== selectedchat._id || userId === user?._id) return;

      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    };

    const handleStopTyping = ({ chatId, userId }) => {
      if (chatId !== selectedchat._id || userId === user?._id) return;

      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedchat?._id, user?._id, setIsTyping, typingTimeoutRef]);
  return (
    <>
      {isTyping && (
        <div className="flex items-center gap-2 ">
          <img
            src={otheruser?.avatar?.url || '/default-avatar.png'}
            className="w-6 h-6 rounded-full"
          />
          <div className="bg-gray-200 px-4 py-4 rounded-lg text-sm text-gray-600 italic flex items-center gap-1">
            <span className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default Typing;
