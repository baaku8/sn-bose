import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

// --- Main Pages ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Teams from "./pages/Teams";

// --- Dashboard Pages ---
// Make sure to create these files in your components/pages folder!
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import MyProfile from "./pages/dashboard/MyProfile";
import MyTeams from "./pages/dashboard/MyTeams";
import Leadership from "./pages/dashboard/Leadership";
import Settings from "./pages/dashboard/Settings"; 

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  // Check authentication status on initial app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  // Show a global loading spinner while verifying session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#201f1f]">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public / Semi-Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/teams" element={<Teams />} />
      
      {/* Auth Routes (Redirect to home if already logged in) */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
      
      {/* Dashboard Nested Routes 
        The parent route checks for authentication. 
        If authenticated, it renders the DashboardLayout (which contains the Sidebar and an <Outlet />).
        The <Outlet /> acts as a placeholder where the nested child routes are rendered.
      */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        {/* Default route: Automatically redirect /dashboard to /dashboard/profile */}
        <Route index element={<Navigate to="profile" replace />} />
        
        {/* Child Routes */}
        <Route path="profile" element={<MyProfile />} />
        <Route path="my-teams" element={<MyTeams />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Optional: Catch-all route for 404 pages */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;