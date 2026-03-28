import React, { useRef, useState } from 'react';
import { useAuth } from '../context/context';
import socket from '../socket/socket.io';
import { Image, Send } from 'lucide-react';
import Messageapi from '../api/message.api';

function Inputfooter({ setmessges, typingTimeoutRef }) {
  const [input, setinput] = useState('');
  const [inputfile, setinputfile] = useState('');
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
const { user, selectedchat, loading } = useAuth();
  const typingRef = useRef(false);
// console.log("input select",selectedchat);
// console.log("user",user);

 const handleclick = async () => {
  
  if (!input.trim() && !inputfile) return;

if (!selectedchat?._id) {
  console.log("No chat selected");
  return;
}

if (!user?._id) {
  console.log("User not ready");
  return;
}
// console.log("SEND CLICK", {
//   input,
//   file: inputfile,
//   user,
//   selectedchat
// });
  socket.emit('stop_typing', {
    chatId: selectedchat._id,
    userId: user._id,
  });
    typingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    const tempId = Date.now();

    const text = input;
    const file = inputfile;

    setinput('');
    setinputfile(null);
    setPreview(null);
    fileRef.current.value = '';

    const tempImageUrl = file ? URL.createObjectURL(file) : null;

    const tempMessage = {
      _id: tempId,
      tempId,
      isTemp: true,
      content: text,
      image: tempImageUrl ? { url: tempImageUrl } : null,
      sender: {
        _id: user._id,
        avatar: user.avatar,
        fullname: user.fullname,
      },
      chat: selectedchat._id,
      createdAt: new Date(),
      status: 'sending',
    };

    setmessges((prev) => [...prev, tempMessage]);
    try {
      const formData = new FormData();
      formData.append('content', text);
      formData.append('chat', selectedchat._id);

      if (file) {
        formData.append('image', file);
      }

      const res = await Messageapi.sendmessage(formData);
      const savedMessage = res.data.data;

      setmessges((prev) =>
        prev.map((msg) => (msg.tempId === tempId ? savedMessage : msg))
      );

      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    } catch (error) {
      console.log(error);

      setmessges((prev) =>
        prev.map((msg) =>
          msg.tempId === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  };

  return (
    <div className="border p-1 m-1 rounded-4xl mb-3">
      {preview && (
        <div className="mb-2 ml-3 relative w-fit">
          <img src={preview} className="w-24 h-24 object-cover rounded-md" />

          <button
            onClick={() => {
              setinputfile(null);
              fileRef.current.value = '';

              if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
              }
            }}
            className="absolute cursor-pointer -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer ml-3 text-gray-600 hover:text-gray-500">
          <Image />
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setinputfile(file);

              const url = URL.createObjectURL(file);
              setPreview(url);
            }}
          />
        </label>

        <input
          type="text"
          value={input}
disabled={loading || !selectedchat?._id || !user}
          onChange={(e) => {
            const value = e.target.value;
            setinput(value);
if (!selectedchat?._id || !user?._id) return;
            if (!typingRef.current) {
              socket.emit('typing', {
                chatId: selectedchat._id,
                userId: user._id,
              });
              typingRef.current = true;
            }

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              socket.emit('stop_typing', {
                chatId: selectedchat._id,
                userId: user._id,
              });
              typingRef.current = false;
            }, 1000);
          }}
      onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleclick();
  }
}}
          placeholder="Type a message..."
          className="flex-1 px-2 py-2 rounded-full focus:outline-none"
        />

        <button
          type="button"
          className="text-gray-500 mr-3 cursor-pointer hover:text-gray-600"
onClick={() => {
  handleclick();
}}        >
          <Send />
        </button>
      </div>
    </div>
  );
}

export default Inputfooter;
