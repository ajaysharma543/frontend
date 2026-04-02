import React, { useEffect } from 'react';
import { useAuth } from '../context/context';
import { Info, PhoneCall, VideoIcon } from 'lucide-react';
import { UseTimeAgo } from '../context/gettimeago';
import LogoutButton from '../authentication/logout';
import socket from '../socket/socket.io';
import { useState } from 'react';
import GroupEdit from './groupNameEdit';

function Rightheader() {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { user, selectedchat, onlineUsers, lastSeenMap ,onlineLoaded } = useAuth();
  const otheruser = selectedchat?.members?.find(
    (item) => item?._id !== user?._id
  );
  const lastSeenTime = lastSeenMap[otheruser?._id];
  const timeAgo = UseTimeAgo(lastSeenTime);
  // console.log(onlineUsers);
  // console.log(onlineUsers.has(otheruser?._id?.toString()));
  useEffect(() => {
  socket.emit("get_online_users");
}, []);

const handle = () => {
  setShowUserInfo(true)
  console.log("first",selectedchat);
  
}

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
    (!onlineLoaded
      ? 'Checking...'
      : onlineUsers.has(otheruser?._id?.toString())
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
<Info
  onClick={
    handle
  }
  className="cursor-pointer hover:text-gray-500`"
/>      </div>

   {showUserInfo && (
  <>
    {/* Overlay */}
    <div
      onClick={() => setShowUserInfo(false)}
      className="fixed inset-0 bg-black/40 z-40"
    />

    {/* Modal */}
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[400px] rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {selectedchat?.isGroup ? "Group Settings" : "User Info"}
          </h2>
          <button onClick={() => setShowUserInfo(false)}>✕</button>
        </div>


        <div className="p-5">
          {!selectedchat?.isGroup ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border">
                <img
                  src={otheruser?.avatar?.url || '/default-avatar.png'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Username</span>
                  <span>@{otheruser?.username}</span>
                </div>

                <div className="flex justify-between">
                  <span>Full Name</span>
                  <span>{otheruser?.fullname}</span>
                </div>

                <div className="flex justify-between">
                  <span>Email</span>
                  <span>{otheruser?.email}</span>
                </div>

                <div className="flex justify-between">
                  <span>Status</span>
                  <span>
                    {onlineUsers.has(otheruser?._id?.toString())
                      ? "🟢 Online"
                      : lastSeenTime
                      ? `Last seen ${timeAgo}`
                      : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <GroupEdit
  setShowUserInfo={setShowUserInfo}
            />
          )}
        </div>
      </div>
    </div>
  </>
)}
    </div>
  );
}

export default Rightheader;


