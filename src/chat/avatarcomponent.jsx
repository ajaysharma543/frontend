import React from "react";
import authapi from "../api/user.api";
import { useAuth } from "../context/context";
import { useNavigate } from "react-router-dom";

function AvatarOptions({loading,setLoading, form,handleChange}) {
const {setUser} = useAuth();
const navigate = useNavigate();
    const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const filteredData = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== "")
    );

    const res = await authapi.updateprofile(filteredData);

    setUser(res.data.data);
    navigate("/")
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