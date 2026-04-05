import React from 'react';
import { useAuth } from '../context/context';
import LogoutButton from '../authentication/logout';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/message.context';

function Profile({ close }) {
  const { user} = useAuth();
  const {  onlineUsers, lastSeenMap } = useChat();
  const isOnline = onlineUsers.has(user?._id?.toString());
  const lastSeen = lastSeenMap[user?._id];
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-169.5">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">My Profile</h2>
        <button onClick={close}>❌</button>
      </div>

      <div className="flex flex-col items-center p-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-400 flex items-center justify-center text-white text-3xl relative">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            user?.fullname?.charAt(0).toUpperCase()
          )}
        </div>

        <h3 className="mt-4 text-lg font-semibold">{user?.username}</h3>

        <p className="text-sm text-gray-500">
          {user?.bio || 'Hey there! I am using chat app'}
        </p>
      </div>

      <div className="px-6 space-y-4">
        <div>
          <p className="text-xs text-gray-800">Email</p>
          <p className="text-sm">{user?.email || 'Not added'}</p>
        </div>

        

        <div>
          <p className="text-xs text-gray-800">User ID</p>
          <p className="text-sm">{user?._id}</p>
        </div>
         <div>
          <p className="text-xs text-gray-800">Gender</p>
          <p className="text-sm">{user?.gender || 'Not added'}</p>
        </div>

        <div className="flex items-center">
          <p className="text-xs text-gray-800">Status :</p>

          {isOnline ? (
            <span className="text-sm text-green-500">🟢 Online</span>
          ) : (
            <span className="text-sm text-gray-400">
              ⚫{' '}
              {lastSeen
                ? `Last seen: ${new Date(lastSeen).toLocaleTimeString()}`
                : 'Offline'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 p-4 border-t flex flex-col items-center gap-3">
        <button
          onClick={() => navigate('/edit-profile')}
          className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ✏️ Edit Profile
        </button>

        <button className="w-full py-2 flex items-center justify-center  bg-gray-100 rounded-lg hover:bg-gray-200">
          <Bell className="text-amber-600" />
          Notification Setting
        </button>

        <button className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          📷 Change Photo
        </button>

        <div className="px-6 w-full flex justify-center py-2 cursor-pointer rounded-xl bg-red-500/20 text-red-500 font-semibold border border-red-500/30 hover:bg-red-500 hover:text-white transition">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Profile;
