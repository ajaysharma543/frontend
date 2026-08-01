// App.jsx
import { useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
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
  const [serverReady, setServerReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    let attemptCount = 0;

    const pingServer = async () => {
      attemptCount += 1;
      if (!cancelled) setAttempt(attemptCount);

      try {
        // Fail fast instead of hanging on a cold server
        const res = await authapi.health({ timeout: 8000 });

        if (res.status === 200) {
          if (!cancelled) setServerReady(true);
          return;
        }
        throw new Error('Server not ready');
      } catch (err) {
        console.log(`Health check attempt ${attemptCount} failed:`, err.message);
        if (!cancelled) {
          // small delay before next retry
          setTimeout(pingServer, 2000);
        }
      }
    };

    pingServer();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!serverReady) {
    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    return (
      <LoadingScreen
        attempt={attempt}
        message={
          elapsedSeconds > 10
            ? 'Waking up the server, this can take up to a minute on first load...'
            : 'Connecting...'
        }
      />
    );
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