import React from 'react'
import { useAuth } from '../context/context'
import { Info, PhoneCall, VideoIcon } from "lucide-react";

function Rightheader({otherUser,timeAgo,lastSeenTime}) {
    const {onlineUsers} = useAuth();
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b">

    <div className="flex items-center gap-3">
     <img
  src={otherUser?.avatar?.url || "/default-avatar.png"}
  className="w-10 h-10 rounded-full object-cover"
/>

  <div className="flex flex-col min-h-[24px]">
  <h2 className="font-semibold text-lg">
    {otherUser?.fullname || "User"}
  </h2>
<p className="text-sm text-gray-500">
  {onlineUsers.has(otherUser?._id)
    ? "Online"
    : lastSeenTime
    ? `Last seen ${timeAgo}`
    : "Offline"}
</p>

</div>
    </div>

    <div className="flex items-center gap-4 text-gray-600">
      <PhoneCall className="cursor-pointer hover:text-gray-500" />
      <VideoIcon className="cursor-pointer hover:text-gray-500" />
      <Info className="cursor-pointer hover:text-gray-500" />
    </div>

  </div>
  )
}

export default Rightheader