import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import authapi from '../api/user.api';
import { Eye, EyeOff, Camera, User, AtSign, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/context';
import socket from '../socket/socket.io';
import AuthInput from './AuthInput';
import AuthBackdrop from './AuthPhotoBackdrop';

function Signup() {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');
  const avatarRegister = register('avatar', { required: 'Profile image is required' });

  const handleImageChange = (e) => {
    avatarRegister.onChange(e);
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onsubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('fullname', data.fullname);
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('avatar', data.avatar[0]);

      const response = await authapi.signup(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      setUser(response.data.data.user);
      socket.emit('join_user', response.data.data.user._id);
      navigate('/', { replace: true });
      toast.success('Registration successful 🎉', { duration: 3000 });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackdrop />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">

          {/* Avatar picker */}
          <div className="flex justify-center mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full cursor-pointer group animate-pop-in"
            >
              <div
                className={`w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden transition-colors
                  ${errors.avatar ? 'border-red-400' : 'border-white/40 group-hover:border-orange-300'} bg-white/20`}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-white/70" />
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform shadow-md">
                <Camera size={11} className="text-white" />
              </span>
              <input
                ref={(el) => { avatarRegister.ref(el); fileInputRef.current = el; }}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </button>
          </div>
          {errors.avatar && (
            <p className="text-red-300 text-xs text-center -mt-1 mb-2">{errors.avatar.message}</p>
          )}
          {avatarPreview && !errors.avatar && (
            <p className="text-white/50 text-xs text-center -mt-1 mb-2">Looking good ✨</p>
          )}

          <h2 className="text-3xl font-semibold text-center text-white mb-1">
            Create Account
          </h2>
          <p className="text-center text-gray-200 mb-2 text-sm">
            Sign up to start chatting 🚀
          </p>

          <form onSubmit={handleSubmit(onsubmit)} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1/2">
                <AuthInput
                  type="text"
                  label="Full Name"
                  icon={<User size={17} />}
                  error={errors.fullname?.message}
                  {...register('fullname', { required: 'Name is required' })}
                />
              </div>
              <div className="w-1/2">
                <AuthInput
                  type="text"
                  label="Username"
                  icon={<AtSign size={17} />}
                  error={errors.username?.message}
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
            </div>

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
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />

            <AuthInput
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              icon={<Lock size={17} />}
              error={errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer text-gray-500 hover:text-orange-500 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register('confirmPassword', {
                required: 'Confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

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
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {loading ? 'Creating...' : 'Sign Up'}
              </span>
            </button>

            <p className="text-center text-sm text-gray-200">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-orange-300 hover:text-orange-400 font-medium"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;