import React, { useEffect, useState } from 'react';
import { Crown, X } from 'lucide-react';
import Chatapi from '../api/chat.api';
import { useAuth } from '../context/context';

function GroupEdit({ setShowUserInfo }) {
  const {
    user,
    selectedchat,
    setselectedchat,
    fetchUsers,
    searchUsers,
    setChatUsers,
    setFilteredUsers,
  } = useAuth();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [groupName, setGroupName] = useState('');
  const adminId =
    typeof selectedchat?.groupAdmin === 'object'
      ? selectedchat.groupAdmin._id
      : selectedchat.groupAdmin;
  // console.log("Admin",adminId);
  const isAdmin = adminId?.toString() === user?._id?.toString();
  const isChanged = groupName !== selectedchat?.chatName;

  // console.log("select",selectedchat);
  // console.log(isAdmin);

  useEffect(() => {
    setGroupName(selectedchat?.chatName || '');
  }, [selectedchat?.chatName]);

  const renamegroup = async () => {
    let previousChat;

    try {
      previousChat = selectedchat;

      setselectedchat((prev) => ({
        ...prev,
        chatName: groupName,
      }));

      const updateFn = (prev) =>
        prev.map((chat) =>
          chat._id === selectedchat._id
            ? {
                ...chat,
                chatName: groupName,

                lastMessage: chat.lastMessage ? { ...chat.lastMessage } : null,
              }
            : chat
        );

      setChatUsers(updateFn);
      setFilteredUsers(updateFn);

      setShowUserInfo(false);

      await Chatapi.renamegroup({
        chat: selectedchat._id,
        chatName: groupName,
      });
      // console.log(res.data.data);
    } catch (error) {
      console.log(error);

      if (previousChat) {
        setselectedchat(previousChat);
      }
    }
  };

  const removeuserfromgroup = async (memberId) => {
    let previousChat;

    try {
      previousChat = selectedchat;

      setselectedchat((prev) => ({
        ...prev,
        members: prev.members.filter(
          (m) => m._id.toString() !== memberId.toString()
        ),
      }));

      await Chatapi.removefromgroup({
        chat: selectedchat._id,
        userid: memberId,
      });
    } catch (error) {
      console.log(error);

      if (previousChat) {
        setselectedchat(previousChat);
      }
    }
  };
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    await fetchUsers(value);
  };

  const addUserToGroup = async (userId) => {
    let previousChat;

    try {
      previousChat = selectedchat;

      const userToAdd = searchResults.find(
        (u) => u._id.toString() === userId.toString()
      );

      setselectedchat((prev) => ({
        ...prev,
        members: [...prev.members, userToAdd],
      }));

      setSearch('');
      setSearchResults([]);

      await Chatapi.addtogroup({
        chat: selectedchat._id,
        userid: userId,
      });
    } catch (error) {
      console.log(error);

      if (previousChat) {
        setselectedchat(previousChat);
      }
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    if (!searchUsers || !selectedchat) return;

    const filtered = searchUsers.filter(
      (user) =>
        !selectedchat.members.some(
          (member) => member._id?.toString() === user._id?.toString()
        )
    );

    setSearchResults(filtered);
  }, [searchUsers, selectedchat, search]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Members</h3>

        <div className="flex flex-wrap gap-2">
          {selectedchat?.members?.map((member) => {
            const isGroupAdmin =
              (
                selectedchat?.groupAdmin?._id || selectedchat?.groupAdmin
              )?.toString() === member._id?.toString();

            return (
              <div
                key={member._id}
                className="flex items-center gap-2 bg-orange-400 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {member.avatar?.url ? (
                    <img
                      src={member.avatar.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    member.fullname?.charAt(0).toUpperCase()
                  )}
                </div>

                <span className="text-sm text-gray-800">
                  {member.fullname}
                  {member._id === user?._id && ' (You)'}
                </span>

                {isGroupAdmin && <Crown className="w-3 h-3 text-yellow-500" />}

                {isAdmin && member._id !== user?._id && (
                  <X
                    onClick={() => removeuserfromgroup(member?._id)}
                    className="w-4 h-4 cursor-pointer text-black hover:text-red-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Group Name</h3>

        {isAdmin ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2 rounded-md text-sm"
            />

            <button
              onClick={renamegroup}
              disabled={!isChanged}
              className={`px-4 rounded-md text-sm text-white ${
                isChanged
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Update
            </button>
          </div>
        ) : (
          <div className="p-2 border rounded-md bg-gray-50 text-sm text-gray-700">
            {selectedchat?.chatName}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="relative">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Add Member
          </h3>

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none p-2 rounded-md text-sm"
            placeholder="Search user to add..."
          />

          {searchResults.length > 0 && (
            <div className="absolute w-full bg-white border mt-1 rounded-md shadow-md max-h-40 overflow-y-auto z-50">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => addUserToGroup(user._id)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    {user.fullname?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.fullname}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupEdit;
