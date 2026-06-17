
import {Routes, Route ,Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
// import Home from "./pages/Home";
import Teams from "./pages/Teams";

import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#201f1f]">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/teams" element={<Teams />} />
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
    </Routes>
  );
}



// import { Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return (
//     // Removed the <BrowserRouter> wrapper from here
//     <Routes>
//       <Route
//         path="/"
//         element={<Home />}
//       />

//       <Route
//         path="/complete-profile"
//         element={<CompleteProfile />}
//       />

//       <Route
//         path="/dashboard"
//         element={<Dashboard />}
//       />
//     </Routes>
//   );
// }

export default App;

// export default App;
// >>>>>>> 0575f364b15503ed61dfa9db37591542329dc7ec
