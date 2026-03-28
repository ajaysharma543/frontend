import { Bell, SearchIcon, User } from 'lucide-react';
import LogoutButton from '../authentication/logout';

function Search({ setsearch }) {
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
        <LogoutButton />
      </div>

    <div className="w-1/6 flex items-center justify-end gap-4">

  <div className="relative group cursor-pointer">
    <div className="p-2 rounded-full bg-gray-100 hover:bg-orange-100 transition-all duration-300 shadow-sm">
      <Bell className="w-5 h-5 text-gray-600 group-hover:text-orange-500 transition" />
    </div>

    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-[1px] rounded-full">
      3
    </span>

    <div className="absolute right-0 mt-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow-lg">
      Notifications
    </div>
  </div>

  <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
      <User />
    </div>
    <span className="text-sm font-medium text-gray-700 hidden md:block">
      Profile
    </span>
  </div>

</div>
    </div>
  );
}

export default Search;
