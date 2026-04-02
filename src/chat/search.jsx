import { Bell, SearchIcon, User } from 'lucide-react';
import LogoutButton from '../authentication/logout';
import Profile from './profile';
import { useState } from 'react';
import Notifications from './notifications';
import { useAuth } from '../context/context';

function Search({ setsearch }) {
  const [showProfile, setShowProfile] = useState(false);
  // console.log(notifications);
  const {user} = useAuth();
  return (
    <div className="w-full flex items-center bg-white px-6 py-2 border-b">
      <div className="w-1/6 flex justify-center">
        <div className="flex items-center px-3 py-1 bg-gray-200 rounded-lg border border-transparent focus-within:border-gray-900">
          <SearchIcon className="text-black mr-2" />

          <input
            type="text"
            placeholder="Search user..."
            onChange={(e) => setsearch(e.target.value)}
            className="outline-none text-black"
          />
        </div>
      </div>

      <div className="w-4/6 text-center">
        <h1 className="text-xl font-bold text-black">Talk-A-Tive</h1>
   
      </div>

    <div className="w-1/6 flex items-center justify-end gap-4">
    <Notifications />
    <button onClick={() => setShowProfile(true)} className="text-sm font-medium text-gray-700 hidden md:block">
  <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
<div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
  {user?.avatar?.url ? (
    <img
      src={user.avatar.url}
      alt="profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <User className="w-5 h-5 text-gray-600" />
  )}
</div>
  </div>
      </button>
{showProfile && (
<div className="fixed right-0 top-0  w-80 bg-white shadow-lg z-50 flex flex-col">
  <Profile close={() => setShowProfile(false)} />
</div>
)}
</div>
    </div>
  );
}

export default Search;
