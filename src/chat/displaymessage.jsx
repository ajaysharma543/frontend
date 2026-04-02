import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/context';
import Options from './options';
import { TimeAgo } from '../context/gettimeago';

function Displaymessage({ messages }) {
  const { user, allUsers, selectedchat } = useAuth();
  const isGroupChat = selectedchat?.isGroup;
  const userId = user?._id?.toString();
  const lastMyMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const senderId = (
        messages[i].sender?._id || messages[i].sender
      )?.toString();
      if (senderId === userId) {
        return messages[i]._id;
      }
    }
    return null;
  }, [messages, userId]);

  return (
    <div className="p-4 flex flex-col gap-1">
      {messages.map((msg, index) => {
        const senderId = (msg.sender?._id || msg.sender)?.toString();
        const isMyMessage = senderId === userId;

        const nextMsg = messages[index + 1];

        const nextSenderId = (
          nextMsg?.sender?._id || nextMsg?.sender
        )?.toString();

        const isLastMessage = !nextMsg || nextSenderId !== senderId;
        const isLastMyMessage = msg._id === lastMyMessageId;

        const readBy = msg.readby || [];
        const readers = isLastMyMessage
          ? readBy
              .map((u) => {
                if (u?.avatar) return u;

                return allUsers?.find(
                  (usr) => usr._id?.toString() === u?.toString()
                );
              })
              .filter((u) => u && u._id?.toString() !== userId)
          : [];

        const isSeen =
          isLastMyMessage &&
          msg.readby?.some((u) => (u._id || u).toString() !== userId);
        return (
          <div key={msg._id} className="flex flex-col">
            <div
              className={`flex items-end gap-2 ${
                isMyMessage ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isMyMessage && (
                <div className="w-8 flex-shrink-0">
                  {isLastMessage && (
                    <img
                      src={msg.sender?.avatar?.url || '/default-avatar.png'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}

              <div
                className={`relative group  rounded-2xl max-w-[65%] break-words ${
                  isMyMessage
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {msg.image?.url && (
                  <img
                    src={msg.image.url}
                    alt="chat"
                    className="max-w-[200px] max-h-[200px] object-cover rounded-md"
                  />
                )}

               <div className="px-3 py-2">
  {msg.content}

  {isMyMessage && (
    <div className="text-[10px] text-right mt-1 opacity-70">
      {msg.status === "sending" && "Sending..."}
      {msg.status === "failed" && "Failed ❌"}
    </div>
  )}
</div>
              </div>
              {isMyMessage && (
                <div className="w-8 flex-shrink-0">
                  {isLastMessage && (
                    <img
                      src={msg.sender?.avatar?.url || '/default-avatar.png'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>

            {isLastMyMessage && !isGroupChat && isSeen && (
              <div className="flex justify-end pr-2 mt-1">
                <span className="text-[11px] text-gray-500">
                  {isSeen && msg.readAt ? TimeAgo(msg.readAt) : ''}
                </span>
              </div>
            )}

            {isLastMessage &&
              isMyMessage &&
              isGroupChat &&
              readers.length > 0 && (
                <div className="flex justify-end pr-2 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">Seen by</span>

                    <div className="flex -space-x-2">
                      {readers.slice(0, 5).map((u, i) => (
                        <img
                          key={i}
                          src={u?.avatar?.url || '/default-avatar.png'}
                          className="w-4 h-4 rounded-full border border-white object-cover"
                        />
                      ))}

                      {readers.length > 5 && (
                        <span className="text-[10px] text-gray-500 ml-1">
                          +{readers.length - 5}
                        </span>
                      )}
                    </div>
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
