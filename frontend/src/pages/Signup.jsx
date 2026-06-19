import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, checkAuth } from '../authSlice'; 
import { GoogleLogin } from '@react-oauth/google';
import axiosClient from '../utils/axiosClient';

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is required"), 
  email: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); 
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      navigate('/'); 
    } catch (err) {
      console.error("Signup failed:", err);
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
      console.error('Google registration failed:', err);
    }
  };

  // NEW THEME: Stealthy inputs with sharp white focus rings
  const inputBaseStyle = "w-full bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors";
  const labelStyle = "block text-sm font-medium text-gray-400 mb-1"; 

  return (
    // NEW THEME: Pure black background
    <div className="min-h-screen flex items-center justify-center p-4 bg-black font-sans selection:bg-white/30">
      
      {/* NEW THEME: Ultra-dark gray card with subtle border */}
      <div className="w-full max-w-md bg-[#0a0a0a] rounded-2xl p-6 border border-[#222]">
        
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              TeamFinder
            </h2>
          </div>
          <p className="text-gray-500 text-sm">Create an account to start building.</p>
        </div>

        {typeof error === 'string' && error.trim() !== '' && (
          <div className="bg-[#1a0505] border border-[#331111] text-[#ff4444] rounded-lg p-3 mb-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className={labelStyle}>First Name</label>
              <input
                type="text"
                placeholder="John"
                className={`${inputBaseStyle} ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                {...register('firstName')}
              />
              {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName.message}</span>}
            </div>
            
            <div className="w-1/2">
              <label className={labelStyle}>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                className={`${inputBaseStyle} ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                {...register('lastName')}
              />
              {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName.message}</span>}
            </div>
          </div>

          <div>
            <label className={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              className={`${inputBaseStyle} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              {...register('email')}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className={labelStyle}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBaseStyle} pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <div className="pt-2"> 
            {/* NEW THEME: High contrast solid white primary button */}
            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing Up...
                </>
              ) : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#333]"></div>
          <span className="px-3 text-[#555] text-sm">OR</span>
          <div className="flex-1 border-t border-[#333]"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error('Google Login Failed')}
            theme="filled_black"
            shape="rectangular"
            text="signup_with"
            size="large"
          />
        </div>

        <div className="text-center mt-6 pt-5 border-t border-[#222]">
          <span className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-gray-300 font-medium transition-colors">
              Login
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;