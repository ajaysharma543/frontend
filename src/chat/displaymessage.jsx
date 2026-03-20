import React, {  useMemo, useState } from "react";
import { useAuth } from "../context/context";
import { TimeAgo } from "../context/gettimeago";
import Options from "./options";

function Displaymessage({ messages,setMessages }) {
  const { user } = useAuth();
const [activeMenu, setActiveMenu] = useState(null);


  const userId = user?._id?.toString();
  const lastMyMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const senderId = (messages[i].sender?._id || messages[i].sender)?.toString();
      if (senderId === userId) {
        return messages[i]._id;
      }
    }
    return null;
  }, [messages, userId]);

  

  return (
    <div className="p-4 space-y-2">
      {messages.map((msg, index) => {
        const senderId = (msg.sender?._id || msg.sender)?.toString();
        const isMyMessage = senderId === userId;

        const nextMessage = messages[index + 1];
        const nextSenderId = (nextMessage?.sender?._id || nextMessage?.sender)?.toString();

        const isLastMessage =
          !nextMessage || nextSenderId !== senderId;

        const isLastMyMessage = msg._id === lastMyMessageId;

        const isSeen =
          isLastMyMessage &&
          msg.readby?.some(
            (u) => (u._id || u).toString() !== userId
          );

        return (
          <div key={msg._id} className="flex flex-col">
            <div
              className={`flex items-end gap-2 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isMyMessage && (
                <div className="w-8 flex justify-start">
                  {isLastMessage && (
                    <img
                      src={msg.sender?.avatar?.url || "/default-avatar.png"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}

<Options
 isMyMessage={isMyMessage}
 setActiveMenu={setActiveMenu}
 activeMenu={activeMenu}
 setMessages={setMessages} 
 msg={msg}
 />
{msg.status === "sending" && (
  <span className="text-xs text-gray-400 ml-2">
    ⏳ Sending...
  </span>
)}
             
            </div>

            {isLastMyMessage && (
              <div className="flex justify-end pr-1">
                <div className="text-[11px] text-gray-500 mt-1">
                  {isSeen && msg.readAt ? TimeAgo(msg.readAt) : ""}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Displaymessage;