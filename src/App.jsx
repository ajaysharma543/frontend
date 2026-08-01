// App.jsx
import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './authentication/login';
import Signup from './authentication/signup';
import Dashboard from './chat/dashboard';
import AuthRedirect from './authentication/protectroute';
import { Toaster } from 'react-hot-toast';
import Editprofile from './chat/editprofile';
import authapi from './api/user.api';
import LoadingScreen from './loadingscreen';

function App() {
  // Only gates the very first app load (server wake-up / auth check).
  const [initialLoading, setInitialLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        await authapi.getcurrentuser();

        if (
          location.pathname === '/login' ||
          location.pathname === '/signup'
        ) {
          navigate('/');
        }
      } catch (err) {
        console.error(
          '❌ No active session:',
          err.response?.data || err.message
        );
        navigate('/login');
      } finally {
        setInitialLoading(false);
      }
    };

    // Only run the full-screen "waking up server" check once, on first mount.
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialLoading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />

      <Routes>
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <Signup />
            </AuthRedirect>
          }
        />

        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />

        <Route path="/" element={<Dashboard />} />
        <Route path="/edit-profile" element={<Editprofile />} />
      </Routes>
    </>
  );
}

export default App;