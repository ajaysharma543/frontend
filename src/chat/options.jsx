import React, { useEffect, useRef } from 'react';
import Messageapi from '../api/message.api';
import { useState } from 'react';
// import authapi from "../api/user.api";

function Options({ isMyMessage, msg }) {
  const [activeMenu, setActiveMenu] = useState('');

  const menuRef = useRef(null);
  const isImageOnly = msg.image?.url && !msg.content;
  useEffect(() => {
    if (activeMenu !== msg._id) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu, msg._id, setActiveMenu]);

  const handleDelete = async () => {
    try {
      const res = await Messageapi.deletemessage(msg._id);
      console.log(res.data.data);

      setActiveMenu(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`relative group rounded-2xl mb-1 px-5 py-2 max-w-[65%] break-words ${
        isImageOnly
          ? 'p-0 bg-transparent'
          : isMyMessage
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
            : 'bg-gray-700 text-white'
      }`}
    >
      <div
        onClick={() => {
          setActiveMenu(activeMenu === msg._id ? null : msg._id);
        }}
        className={`absolute top-1 ${
          isMyMessage ? '-left-6' : '-right-6'
        } text-black pl-2 pr-2 text-lg opacity-0 group-hover:opacity-100 transition cursor-pointer`}
      >
        ⋮
      </div>

      {activeMenu === msg._id && (
        <div
          ref={menuRef}
          className={`absolute -top-14 ${
            isMyMessage ? '-left-28' : '-right-28'
          } bg-white shadow-lg rounded-md text-sm z-50`}
        >
          {isMyMessage ? (
            <>
              <div className="px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                ✏️ Edit
              </div>

              <div
                onClick={handleDelete}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
              >
                🗑 Delete
              </div>

              <div className="px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                📋 Copy
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                📋 Copy
              </div>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                🚩 Report
              </div>
            </>
          )}
        </div>
      )}

      {msg.isDeleted ? (
        <div className="italic text-white text-sm">
          🚫 This message was deleted
        </div>
      ) : (
        <>
          {msg.image?.url && (
            <img src={msg.image.url} className="max-w-[200px] rounded-md" />
          )}

          {msg.content && <div>{msg.content}</div>}
        </>
      )}
    </div>
  );
}

export default Options;
