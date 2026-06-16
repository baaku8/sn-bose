import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    // Removed the <BrowserRouter> wrapper from here
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/complete-profile"
        element={<CompleteProfile />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
    </Routes>
  );
}

export default App;