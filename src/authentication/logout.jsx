import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authapi from "../api/user.api";

function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ error state
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    setError(""); // clear previous error

    try {
      await authapi.logout();
      console.log("✅ User logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("❌ Error logging out:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Something went wrong while logging out."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        className={`px-6 py-2  cursor-pointer rounded-2xl backdrop-blur-md bg-red-500/20 text-red-400 font-semibold border border-red-500/30 hover:bg-red-500/40 hover:text-white hover:border-red-500 transition-all duration-300 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Logging out..." : "Logout"}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </>
  );
}

export default LogoutButton;
