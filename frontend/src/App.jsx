import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

// --- Main Pages ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Teams from "./pages/Teams";
import CompleteProfile from "./pages/CompleteProfile";

// --- Dashboard Pages ---
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import MyProfile from "./pages/dashboard/MyProfile";
import MyTeams from "./pages/dashboard/MyTeams";
import Leadership from "./pages/dashboard/Leadership";
import Settings from "./pages/dashboard/Settings";

// --- Dynamic View Pages ---
import ManageTeam from "./pages/dashboard/ManageTeam";
import ViewTeam from "./pages/dashboard/ViewTeam";
import ViewProfile from "./pages/dashboard/ViewProfile";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Global Loading State while checking Redux authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <span className="animate-spin h-10 w-10 border-4 border-neutral-600 border-t-white rounded-full"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/teams" element={<Teams />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
      {/* Protected Dashboard Routes */}
      <Route 
         path="/dashboard" 
         element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="profile" replace />} />
        
        {/* Core Sidebar Routes */}
        <Route path="profile" element={<MyProfile />} />
        <Route path="my-teams" element={<MyTeams />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="settings" element={<Settings />} />

        {/* Dynamic Parameter Routes */}
        <Route path="manage/:id" element={<ManageTeam />} />
        <Route path="team/:id" element={<ViewTeam />} />
        <Route path="user/:id" element={<ViewProfile />} /> 

      </Route>
    </Routes>
  );
}

export default App;