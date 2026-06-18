import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice"; // Make sure the path is correct

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter">
          SyncUP<span className="text-neutral-600">.</span>
        </h1>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Go to Dashboard
              </button>
              
              {/* NEW LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 mt-32 md:mt-48 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
          Finding teams <br className="hidden md:block" />
          <span className="text-neutral-500">is easy now.</span>
        </h1>

        <p className="mt-6 md:mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl font-light">
          Connect with developers, designers, AI enthusiasts, and builders for your next project. Stop searching and start shipping.
        </p>

        {/* Dynamic CTA Button */}
        <button
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
          className="mt-12 px-8 py-3.5 rounded-full border border-neutral-800 bg-neutral-900 text-white text-sm font-medium shadow-sm hover:border-neutral-700 hover:bg-neutral-800 transition-all"
        >
          {isAuthenticated ? "Explore Teams →" : "Get Started →"}
        </button>
      </main>
      
    </div>
  );
}