import LogoutButton from "../authentication/logout";
import { useAuth } from "../context/context";
import { useEffect, useState } from "react";
import authapi from "../api/user.api";
import Displaymessage from "./displaymessage";
import socket from "../socket/socket.io";
import { useRef } from "react";
import { UseTimeAgo } from "../context/gettimeago";
import Typing from "./typing";
import Rightheader from "./rightheader";
import Inputfooter from "./inputfooter";

function Rightchat({data}) {
  const [messages, setMessages] = useState([]);
  const { user, lastSeenMap  } = useAuth();
const bottomRef = useRef(null);
const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef(null);


useEffect(() => {
  socket.on("message_deleted", ({ messageId }) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  });

  return () => {
    socket.off("message_deleted");
  };
}, []);
useEffect(() => {
  if (!data?._id) return;

  socket.emit("join_chat", data._id);

}, [data?._id]);

useEffect(() => {
  const handler = async (message) => {
    const chatId = message.chat?._id || message.chat;

    if (chatId?.toString() !== data?._id?.toString()) return;

   setMessages(prev => {
  const filtered = prev.filter(
    m =>
      !(
        m.isTemp &&
        m.content === message.content &&
        m.sender?._id === message.sender?._id
      )
  );

  const exists = filtered.some(m => m._id === message._id);
  if (exists) return filtered;

  return [...filtered, message];
});

    if (message.sender._id !== user._id) {
      authapi.markasread(data._id);
    }
  };

  socket.on("new_message", handler);
  return () => socket.off("new_message", handler);
}, [data?._id, user?._id]);

useEffect(() => {
  const handleRead = ({ chatId, userId }) => {
    if (chatId !== data?._id) return;

    setMessages(prev => {
      let updated = false;

      const newMessages = prev.map(msg => {
        const readby = msg.readby || [];

        const alreadyRead = readby.some(
          u => (u._id || u).toString() === userId.toString()
        );

        if (alreadyRead) return msg;
        updated = true;

        return {
          ...msg,
          readby: [...readby, userId],
          readAt: new Date()
        };
      });

      return updated ? newMessages : prev;
    });
  };

  socket.on("messages_read", handleRead);

  return () => socket.off("messages_read", handleRead);
}, [data]);


useEffect(() => {
  if (!data?._id) return;

  let isMounted = true;

  const fetchMessages = async () => {
    try {
      const response = await authapi.getmessage(data._id);

      if (!isMounted) return;

      setMessages(response.data.data.messages);

      authapi.markasread(data._id);
    } catch (error) {
      console.log(error);
    }
  };

  fetchMessages();

  return () => {
    isMounted = false;
  };
}, [data?._id]);



useEffect(() => {
  setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 50);
}, [messages, isTyping]); 

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <h2 className="text-gray-500 text-xl">
          nothing here click to message
        </h2>
        <LogoutButton />
      </div>
    );
  }
const otherUser = data?.members?.find(
  member => member._id !== user?._id
);
const lastSeenTime = lastSeenMap[otherUser?._id];
const timeAgo = UseTimeAgo(lastSeenTime);
  return(

<div className="h-full flex flex-col">

<Rightheader 
otherUser={otherUser} 
timeAgo={timeAgo}
lastSeenTime={lastSeenTime}
 />
  
<div className="flex-1 overflow-y-auto p-4">
  <Displaymessage messages={messages} setMessages={setMessages} />

  <Typing 
  data={data} 
  isTyping={isTyping}
   setIsTyping={setIsTyping}
   otherUser={otherUser}
    typingTimeoutRef={typingTimeoutRef}
    />

  <div ref={bottomRef}></div>
</div>

  <Inputfooter
  data={data}
  typingTimeoutRef={typingTimeoutRef}
  setMessages={setMessages}
   />

</div>
  )
}

export default Rightchat;