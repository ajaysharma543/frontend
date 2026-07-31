import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import authapi from '../api/user.api';
import { useAuth } from '../context/context';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import AuthInput from './AuthInput';
import AuthBackdrop from './AuthPhotoBackdrop';

function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onSubmit = async (data) => {
    setError('');
    try {
      setLoading(true);
      await authapi.login(data);
      const current = await authapi.getcurrentuser();
      localStorage.setItem('user', JSON.stringify(current.data.data.user));
      setUser(current.data.data.user);
      navigate('/');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(errorMessage);
      setErrorKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <div className="flex justify-center mb-3 animate-pop-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <i className="fa-solid fa-comments text-white text-sm"></i>
            </div>
          </div>

          <h2 className="text-3xl font-semibold text-center text-white mb-2">Login Account</h2>
          <p className="text-center text-gray-200 mb-6 text-sm">Welcome back 👋 Please login to continue</p>

          {error && (
            <div key={errorKey} className="mb-4 rounded-xl border border-red-400/40 bg-red-500/20 px-3 py-2 animate-shake">
              <p className="text-red-100 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthInput
              type="email"
              label="Email Address"
              icon={<Mail size={17} />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <AuthInput
              type={showPassword ? 'text' : 'password'}
              label="Password"
              icon={<Lock size={17} />}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-gray-500 hover:text-orange-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register('password', { required: 'Password is required' })}
            />

            <div className="flex justify-end text-sm">
              <Link to="/" className="text-gray-200 hover:text-white hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500
                hover:from-orange-500 hover:to-orange-600 transition text-white font-semibold shadow-lg shadow-orange-500/30
                flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {!loading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
              )}
              <span className="relative flex items-center gap-2">
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {loading ? 'Logging In...' : 'Login'}
              </span>
            </button>

            <p className="text-center text-sm text-gray-200">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-300 hover:text-orange-400 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;