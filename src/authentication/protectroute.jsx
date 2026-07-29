import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authapi from '../api/user.api';

function AuthRedirect({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await authapi.getcurrentuser(); // check cookie session
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading)
    return (
      <div className="bg-black flex items-center justify-center min-h-screen w-full text-white">
        Loading...
      </div>
    );

  if (isAuth) return <Navigate to="/" replace />;

  return children;
}

export default AuthRedirect;
