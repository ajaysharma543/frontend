import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authapi from '../api/user.api';
import { useAuth } from '../context/context';

function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // ✅ error state
  const navigate = useNavigate();
  const {setUser} = useAuth();
  const handleLogout = async () => {
    setLoading(true);
    setError(''); // clear previous error

    try {
      await authapi.logout();
        localStorage.removeItem("user");
  setUser(null);
      // console.log('✅ User logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('❌ Error logging out:', err.response?.data || err.message);
      setError(
        err.response?.data?.message || 'Something went wrong while logging out.'
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
        className={` ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </>
  );
}

export default LogoutButton;
