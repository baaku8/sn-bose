
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // .unwrap() ensures we wait for the backend to clear the cookie
      await dispatch(logoutUser()).unwrap(); 
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#201f1f] text-gray-200 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-[#2e2d2d] border border-gray-700/50 p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center">
        
        <div className="w-20 h-20 bg-[#cbbda6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-[#cbbda6]">
            {user?.firstName?.charAt(0) || 'U'}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="text-[#cbbda6]">{user?.firstName}</span>!
        </h1>
        
        <p className="text-gray-400 mb-8">
          You have successfully authenticated and reached the protected dashboard.
        </p>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center w-full max-w-xs mx-auto disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
