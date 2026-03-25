import { Bell, SearchIcon } from 'lucide-react';

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
      </div>

      <div className="w-1/6 flex justify-end">
        <Bell className="cursor-pointer text-gray-600 hover:text-orange-500" />
      </div>
    </div>
  );
}

export default Search;
