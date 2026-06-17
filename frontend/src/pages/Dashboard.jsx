
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

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const navigate = useNavigate(); // Fixed: Moved inside the component
//   const [activeTab, setActiveTab] = useState("profile");

//   return (
//     <div className="min-h-screen bg-[#15161c] text-white flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-slate-900 border-r border-slate-700 p-6">
//         {/* <h1 className="text-3xl font-bold mb-10">
//           Sync<span className="text-blue-400">UP</span>
//         </h1>

//         <div className="space-y-3">
//           <button
//             onClick={() => setActiveTab("profile")}
//             className={`w-full text-left p-3 rounded-lg transition ${
//               activeTab === "profile"
//                 ? "bg-green-600"
//                 : "bg-slate-800 hover:bg-slate-700"
//             }`}
//           >
//             My Profile
//           </button>

//           <button
//             onClick={() => setActiveTab("teams")}
//             className={`w-full text-left p-3 rounded-lg transition ${
//               activeTab === "teams"
//                 ? "bg-green-600"
//                 : "bg-slate-800 hover:bg-slate-700"
//             }`}
//           >
//             My Teams
//           </button>

//           <button
//             onClick={() => setActiveTab("leadership")}
//             className={`w-full text-left p-3 rounded-lg transition ${
//               activeTab === "leadership"
//                 ? "bg-green-600"
//                 : "bg-slate-800 hover:bg-slate-700"
//             }`}
//           >
//             Leadership
//           </button>

//           <button
//             onClick={() => setActiveTab("settings")}
//             className={`w-full text-left p-3 rounded-lg transition ${
//               activeTab === "settings"
//                 ? "bg-green-600"
//                 : "bg-slate-800 hover:bg-slate-700"
//             }`}
//           >
//             Settings
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-10">
//         {activeTab === "profile" && (
//             <>
//                 <h2 className="text-4xl font-bold mb-6">
//                 My Profile
//                 </h2>

//                 <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-5 mb-6">
//                 <h3 className="text-yellow-400 font-bold text-lg">
//                     Complete Your Profile
//                 </h3>

//                 <p className="mt-2 text-slate-300">
//                     Add your skills, interests, college,
//                     bio and social links to improve team
//                     matching.
//                 </p>

//                 <button
//                     onClick={() => navigate("/complete-profile")}
//                     className="mt-4 bg-blue-500 px-5 py-2 rounded-lg hover:bg-blue-400"
//                 >
//                     Complete Profile
//                 </button>
//                 </div>

//                 <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
//                 <p className="text-slate-400">
//                     You can still join teams even if your
//                     profile is incomplete.
//                 </p>
//                 </div>
//             </>
//         )}

//         {activeTab === "teams" && (
//           <>
//             <h2 className="text-4xl font-bold mb-6">
//               My Teams
//             </h2>

//             <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
//               Teams created/joined will appear here.
//             </div>
//           </>
//         )}

//         {activeTab === "leadership" && (
//           <>
//             <h2 className="text-4xl font-bold mb-6">
//               Leadership
//             </h2>

//             <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
//               Leadership projects will appear here.
//             </div>
//           </>
//         )}

//         {activeTab === "settings" && (
//           <>
//             <h2 className="text-4xl font-bold mb-6">
//               Settings
//             </h2>

//             <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
//               Account settings will appear here.
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// } */}
