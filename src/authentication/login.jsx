import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import bg from '../assets/684352c65e4b85577f86845f1d930748-62051589143562rhvtbduqia.jpg';
import authapi from '../api/user.api';
import { useAuth } from '../context/context';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
    const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onSubmit = async (data) => {
    try {
            setLoading(true);
      await authapi.login(data);

      const current = await authapi.getcurrentuser();

      localStorage.setItem('user', JSON.stringify(current.data.data.user));

      setUser(current.data.data.user);

      // console.log(current.data.data.user);

      navigate('/');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password. Please try again.';
      console.log(errorMessage);
    }
    finally{
            setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >

      <div className="w-full max-w-md p-5 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-semibold text-center text-gray-600 mb-2">
          Login Account
        </h2>

        <p className="text-center text-gray-600 mb-8 text-sm">
          Welcome back 👋 Please login to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-3 rounded-xl text-black border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-400
              transition duration-200"
            />

            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">
              Password
            </label>
                        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-3 rounded-xl text-black border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-400
              transition duration-200"
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

          <div className="flex justify-end text-sm">
            <Link
              to="/"
              className="text-gray-200 hover:text-white hover:underline"
            >
              Forgot Password?
            </Link>
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
              'Login'
            )}
          </button>

          <p className="text-center text-sm text-gray-200">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="text-orange-300 hover:text-orange-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
