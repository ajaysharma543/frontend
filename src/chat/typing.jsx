import React, { useEffect } from 'react'
import socket from '../socket/socket.io';
import { useAuth } from '../context/context';

function Typing({otherUser, isTyping,setIsTyping,typingTimeoutRef,data}) {
    const {user} = useAuth();

    
   useEffect(() => {
  if (!data?._id) return;

  socket.emit("join_chat", data._id);

}, [data]);

   useEffect(() => {
  if (!data?._id) return;

  const handleTyping = ({ chatId, userId }) => {
    if (chatId !== data._id || userId === user?._id) return;

    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleStopTyping = ({ chatId, userId }) => {
    if (chatId !== data._id || userId === user?._id) return;

    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  socket.on("typing", handleTyping);
  socket.on("stop_typing", handleStopTyping);

  return () => {
    socket.off("typing", handleTyping);
    socket.off("stop_typing", handleStopTyping);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, [data?._id, user?._id,setIsTyping,typingTimeoutRef]);
  return (
    <>
         {isTyping && (
    <div className="flex items-center gap-2 mt-2">
      <img
        src={otherUser?.avatar?.url || "/default-avatar.png"}
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
  )
}

export default Typing