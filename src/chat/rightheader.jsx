import React from 'react';
import { useAuth } from '../context/context';
import { Info, PhoneCall, VideoIcon } from 'lucide-react';
import { UseTimeAgo } from '../context/gettimeago';

function Rightheader() {
  const { user, selectedchat, onlineUsers, lastSeenMap } = useAuth();
  const otheruser = selectedchat?.members?.find(
    (item) => item?._id !== user?._id
  );
  const lastSeenTime = lastSeenMap[otheruser?._id];
  const timeAgo = UseTimeAgo(lastSeenTime);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b">
      <div className="flex items-center gap-3">
        {selectedchat.isGroup ? (
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
            {selectedchat.chatName?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            src={otheruser?.avatar?.url || '/default-avatar.png'}
            className="w-10 h-10 rounded-full"
          />
        )}

        <div className="flex flex-col min-h-[24px]">
          <h2 className="font-semibold text-lg">
            {selectedchat.isGroup
              ? selectedchat?.chatName
              : otheruser?.fullname}
          </h2>
          <p className="text-sm text-gray-500">
            {!selectedchat.isGroup &&
              (onlineUsers.has(otheruser?._id)
                ? 'Online'
                : lastSeenTime
                  ? `Last seen ${timeAgo}`
                  : 'Offline')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-gray-600">
        <PhoneCall className="cursor-pointer hover:text-gray-500" />
        <VideoIcon className="cursor-pointer hover:text-gray-500" />
        <Info className="cursor-pointer hover:text-gray-500" />
      </div>
    </div>
  );
}

export default Rightheader;
