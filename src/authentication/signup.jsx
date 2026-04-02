import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import bg from '../assets/684352c65e4b85577f86845f1d930748-62051589143562rhvtbduqia.jpg';
import authapi from '../api/user.api';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/context';
import socket from '../socket/socket.io';
function Signup() {
  const [fileName, setFileName] = useState('No file chosen');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {setUser} = useAuth();
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
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

setUser(response.data.data.user);
socket.emit("join_user", response.data.data.user._id);
      navigate('/', { replace: true });
      toast.success('Registration successful 🎉', { duration: 3000 });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };
  const password = watch('password');
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-md p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-1">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-4 text-sm">
          Sign up to start chatting 🚀
        </p>

        <form onSubmit={handleSubmit(onsubmit)} className="space-y-3">
          {/* Name + Username */}
          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-white">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                {...register('fullname', { required: 'Name is required' })}
                className="w-full px-3 py-2 rounded-xl text-black border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {errors.fullname && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.fullname.message}
                </p>
              )}
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1 text-white">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter username"
                {...register('username', { required: 'Username is required' })}
                className="w-full px-3 py-2 rounded-xl text-black border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 rounded-xl text-black border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-2 pr-10 rounded-xl text-black border border-gray-300
      focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                {...register('confirmPassword', {
                  required: 'Confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                className="w-full px-4 py-2 pr-10 rounded-xl text-black border border-gray-300
      focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3  cursor-pointer top-1/2 -translate-y-1/2 text-black"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">
              Profile Image
            </label>

            <input
              type="file"
              accept="image/*"
              {...register('avatar', {
                required: 'Profile image is required',
              })}
              onChange={handleImageChange}
              className="w-full text-sm text-white
    file:mr-3 file:py-2 file:px-4
    file:rounded-lg file:border-0
    file:bg-orange-400 file:text-white
    hover:file:bg-orange-500"
            />

            {errors.avatar && (
              <p className="text-red-400 text-xs mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 
  hover:from-orange-500 hover:to-orange-600 transition text-white font-semibold shadow-lg
  flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Login Link */}
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
  );
}

export default Signup;
