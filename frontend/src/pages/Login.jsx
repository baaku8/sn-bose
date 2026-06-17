import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; 
import { loginUser, clearError, checkAuth } from "../authSlice";
import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axiosClient from '../utils/axiosClient';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid Email"),
  password: z.string().min(1, "Password is required") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

// 1. ONLY clear errors when the component first mounts (loads)
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]); // Empty dependency array (plus dispatch) means this runs strictly ONCE

  // 2. ONLY handle redirects when the authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      // Wait for the backend to confirm the login
      await dispatch(loginUser(data)).unwrap();
      
      // Instantly teleport the user to the Dashboard
      navigate('/');
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await axiosClient.post('user/google', {
        token: credentialResponse.credential
      });
      await dispatch(checkAuth());
      navigate('/');
    } catch (err) {
      console.error('Google verification failed:', err);
    }
  };

  const inputBaseStyle = "w-full bg-[#262626] border border-gray-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#cbbda6] focus:ring-1 focus:ring-[#cbbda6] transition-colors";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#201f1f] font-sans selection:bg-[#cbbda6]/30">
      <div className="w-full max-w-md bg-[#2e2d2d] rounded-2xl shadow-2xl p-8 border border-gray-700/50">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Team<span className="text-[#cbbda6]">Finder</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Please enter your details.</p>
        </div>

        {typeof error === 'string' && error.trim() !== '' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-6 flex items-center gap-3">
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`${inputBaseStyle} ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}`} 
              {...register('email')}
            />
            {errors.email && <span className="text-red-400 text-sm mt-1.5 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className={labelStyle}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBaseStyle} pr-12 ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-[#cbbda6] transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="text-red-400 text-sm mt-1.5 block">{errors.password.message}</span>}
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-[#f1efe6] hover:bg-[#b5a790] text-[#262626] font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error('Google Login Failed')} theme="filled_black" shape="rectangular" text="continue_with" size="large" />
        </div>

        <div className="text-center mt-8 pt-6 border-t border-gray-700/50">
          <span className="text-gray-400 text-sm">
            Don't have an account? <Link to="/signup" className="text-[#dcab5b] font-semibold">Sign Up</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;