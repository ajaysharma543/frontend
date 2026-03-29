import React, { useRef, useState } from 'react';
import { useAuth } from '../context/context';
import authapi from '../api/user.api';
import { useNavigate } from 'react-router-dom';
import AvatarOptions from './avatarcomponent';

function Editprofile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
const [showOptions, setShowOptions] = useState(false);
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    gender: user?.gender || '',
  });
const fileRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleCloseOptions = () => {
  setShowOptions(false);
};

const changeimage = async (file) => {
  if (!file) return;

  try {
    const previewUrl = URL.createObjectURL(file);

    setUser((prev) => ({
      ...prev,
      avatar: {
        ...prev.avatar,
        url: previewUrl,
      },
    }));

    setShowOptions(false);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await authapi.updateaccountdetails(formData);

    setUser(res.data.data);

  } catch (err) {
    console.log(err);
  }
};


  return (
 <div className="min-h-screen flex justify-center items-center px-4 py-8">
  <div className="w-full max-w-xl bg-white rounded-2xl p-6 space-y-6">

    {/* Header */}
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-black"
      >
        ← Back
      </button>

      <h2 className="text-xl font-semibold">Edit Profile</h2>

      <div />
    </div>

    <div className="flex items-center justify-between pb-4 bg-gray-300 rounded-3xl p-4">

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-orange-400 overflow-hidden flex items-center justify-center text-white text-xl">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.fullname?.charAt(0).toUpperCase()
          )}
        </div>

        <div className='flex flex-col'>
         <h1>{user.fullname}</h1>
         <h1>{user.username}</h1>
        </div>
      </div>

     <button
  onClick={() => setShowOptions(true)}
  className="bg-blue-500 text-white px-5 p-3 rounded-2xl hover:bg-blue-600 text-sm font-medium"
>
  Change Photo
</button>
    </div>
{showOptions && (
  <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">

    <div
      className="bg-white w-[90%] max-w-sm rounded-2xl p-5 space-y-4 shadow-xl animate-scaleIn"
      onClick={(e) => e.stopPropagation()}
    >
      
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-400 flex items-center justify-center text-white text-xl">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.fullname?.charAt(0).toUpperCase()
          )}
        </div>
      </div>
<input
  type="file"
  hidden
  ref={fileRef}
  accept="image/*"
  onChange={(e) => changeimage(e.target.files[0])}
/>
      <h3 className="text-center border-b-2 font-semibold text-lg">
        Profile Photo
      </h3>

    <button
  onClick={() => fileRef.current.click()}
  className="w-full py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
>
  📷 Upload Photo
</button>

      <button className="w-full py-3 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition">
        ❌ Remove Photo
      </button>

      <button
        onClick={handleCloseOptions}
        className="w-full py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        Cancel
      </button>

    </div>
  </div>
)}
   <AvatarOptions
   form={form}
   handleChange={handleChange}
   loading={loading}
   setLoading={setLoading}
    />

  </div>
</div>

  );
}

export default Editprofile;

