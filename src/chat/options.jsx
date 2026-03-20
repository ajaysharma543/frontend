import React, { useEffect, useRef } from "react";
import authapi from "../api/user.api";

function Options({ isMyMessage, setActiveMenu, activeMenu, msg, setMessages }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (activeMenu !== msg._id) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu, msg._id, setActiveMenu]);

  const handleDelete = async () => {
    try {
      await authapi.deletemessage(msg._id);

      setMessages((prev) => prev.filter((m) => m._id !== msg._id));

      setActiveMenu(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`relative group rounded-lg max-w-xs break-words ${
        isMyMessage ? "bg-black text-white" : "bg-green-300 text-black"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(activeMenu === msg._id ? null : msg._id);
        }}
        className={`absolute top-1 ${
          isMyMessage ? "-left-6" : "-right-6"
        } text-black pl-2 pr-2 text-lg opacity-0 group-hover:opacity-100 transition cursor-pointer`}
      >
        ⋮
      </div>

      {activeMenu === msg._id && (
        <div
          ref={menuRef}
          className={`absolute -top-14 ${
            isMyMessage ? "-left-28" : "-right-28"
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
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                📋 Copy
              </div>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                🚩 Report
              </div>
            </>
          )}
        </div>
      )}

      {msg.image?.url && (
        <img
          src={msg.image.url}
          alt="chat"
          className="max-w-[200px] max-h-[200px] object-cover rounded-md"
        />
      )}

      {msg.content && <p className="px-3 py-2">{msg.content}</p>}
    </div>
  );
}

export default Options;