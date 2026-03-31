import React, { useState, useEffect } from 'react';
import { SearchIcon, X } from 'lucide-react';
import Chatapi from '../api/chat.api';
import { useAuth } from '../context/context';

function Groupchat() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [name, setname] = useState('');
  const {  searchUsers,setselectedchat,fetchUsers,user,setChatUsers } = useAuth();
  useEffect(() => {
    if (search.trim() === '') {
      setDebouncedSearch('');
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
  if (!debouncedSearch.trim()) return;

  fetchUsers(debouncedSearch);
}, [debouncedSearch]);

const filteredUser =
  debouncedSearch.trim() === ''
    ? []
    : searchUsers.filter((u) => u._id !== user?._id);

  const toggleUser = (user) => {
    const exists = selectedUsers.some((u) => u._id === user._id);

    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const creategroup = async () => {
    try {
      if (!name.trim()) {
        alert('Enter group name');
        return;
      }
      if (selectedUsers.length === 0) {
        alert('Select at least two user');
        return;
      }
      const res = await Chatapi.creategroupchat({
        name,
        members: selectedUsers.map((u) => u._id),
      });
      const newGroup = res.data.data;

      const newItem = {
        _id: newGroup._id,
        isGroup: true,
        chatName: newGroup.chatName,
        members: newGroup.members,
        lastMessage: null,
      };

      setChatUsers((prev) => {
         const exists = prev.some((chat) => chat._id === newItem._id);

  if (exists) return prev; 
        const updated = [newItem, ...prev];

        return updated.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });

      setselectedchat(newItem);
      setOpen(false);
      setSelectedUsers([]);
      setname('');
      setSearch('');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mx-4 my-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        + New Group Chat
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white w-[92%] max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Create Group Chat
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Enter group name..."
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 p-2.5 mb-4 rounded-lg outline-none transition"
            />

            <div className="flex items-center px-3 py-2 rounded-lg border border-gray-300 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition">
              <SearchIcon className="mr-2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none bg-transparent w-full text-sm"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-orange-400 flex items-center justify-center text-white text-xs">
                      {u.avatar?.url ? (
                        <img
                          src={u.avatar.url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.fullname?.charAt(0).toUpperCase()
                      )}
                    </div>

                    <span>{u.fullname}</span>

                    <button
                      onClick={() => toggleUser(u)}
                      className="text-xs hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto mt-4 rounded-lg border border-gray-200">
              {search.trim() === '' ? null : loading ? (
                <p className="text-sm text-gray-400 p-3 animate-pulse">
                  Searching users...
                </p>
              ) : filteredUser.length > 0 ? (
                filteredUser.map((u) => {
                  const isSelected = selectedUsers.some(
                    (su) => su._id === u._id
                  );

                  return (
                    <div
                      key={u._id}
                      onClick={() => toggleUser(u)}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition rounded-lg ${
                        isSelected ? 'bg-orange-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-400 flex items-center justify-center text-white text-sm font-medium">
                        {u.avatar?.url ? (
                          <img
                            src={u.avatar.url}
                            alt={u.fullname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.fullname?.charAt(0).toUpperCase()
                        )}
                      </div>

                      <span className="text-sm text-gray-800 font-medium">
                        {u.fullname}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 p-3">No users found</p>
              )}
            </div>

            <button
              disabled={selectedUsers.length === 0 || !name.trim()}
              onClick={creategroup}
              className={`mt-5 w-full py-2.5 rounded-lg font-medium shadow-md transition ${
                selectedUsers.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg'
              }`}
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Groupchat;
