// App.jsx
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './authentication/login';
import Signup from './authentication/signup';
import Dashboard from './chat/dashboard';
import AuthRedirect from './authentication/protectroute';
import { Toaster } from 'react-hot-toast';
import Rightchat from './chat/rightchat';
import Editprofile from './chat/editprofile';
import authapi from './api/user.api';
import LoadingScreen from './loadingscreen'

function App() {
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const pingServer = async () => {
      try {
        // Hit a lightweight health-check route on your backend
        const res = await fetch( authapi.okdata());
        if (res.ok) {
          if (!cancelled) setServerReady(true);
          return;
        }
        throw new Error('Server not ready');
      } catch (err) {
        // Server likely still spinning up (Render/Heroku cold start) — retry
        if (!cancelled) {
          setTimeout(pingServer, 3000);
        }
      }
    };

    pingServer();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!serverReady) {
    return <LoadingScreen />;
  }

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