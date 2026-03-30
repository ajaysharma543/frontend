import React, { useEffect, useState } from "react";
import authapi from "../api/user.api";
import { useAuth } from "../context/context";
import { useNavigate } from "react-router-dom";

function AvatarOptions({loading,setLoading}) {
const {setUser,user} = useAuth();

const [form, setForm] = useState({
    fullname: user?.fullname || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    bio: user?.bio || '',
    gender: user?.gender || '',
  });
  useEffect(() => {
  if (user) {
    setForm({
      fullname: user.fullname || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      bio: user.bio || '',
      gender: user.gender || '',
    });
  }
}, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);

    const filteredData = {};

    if (form.bio !== undefined) filteredData.bio = form.bio;
    if (form.username) filteredData.username = form.username;
    if (form.fullname) filteredData.fullname = form.fullname;
    if (form.email) filteredData.email = form.email;

    if (form.gender !== undefined) {
      filteredData.gender = form.gender === "" ? null : form.gender;
    }

    const res = await authapi.updateaccountdetails(filteredData);

const updatedUser = res?.data?.data?.user;

if (updatedUser) {
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
    navigate("/");
}  
  } catch (err) {
    
    console.log(err);
  } finally {
    setLoading(false);
  }
};

    return(
    <form onSubmit={handleSubmit} className="space-y-4">
  <div>
      <label className="text-sm text-gray-600">Bio</label>
      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
      />
    </div>

    <div className="space-y-4 ">

     

      <div>
        <label className="text-sm text-gray-600">change Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">change fullname</label>
        <input
          type="text"
          name="fullname"
          value={form.fullname}
          onChange={handleChange}
          className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </div>
 <div>
        <label className="text-sm text-gray-600">Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </div>
      <div>
        <label className="text-sm text-gray-600">Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full mt-1 border p-2 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
        >
        <option value="">Select Gender</option>
<option value="male">Male</option>
<option value="female">Female</option>
<option value="other">Other</option>
        </select>
      </div>
    </div>

    {/* 🔥 SAVE BUTTON */}
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
    >
      {loading ? "Updating..." : "Save Changes"}
    </button>
 </form>
  );
}

export default AvatarOptions;