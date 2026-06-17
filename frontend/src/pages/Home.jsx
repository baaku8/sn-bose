import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";

export default function Home() {
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5001/user/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-medium">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter">
          SyncUP<span className="text-neutral-600">.</span>
        </h1>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Sign up
          </button>
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

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-12 px-8 py-3.5 rounded-full border border-neutral-800 bg-neutral-900 text-white text-sm font-medium shadow-sm hover:border-neutral-700 hover:bg-neutral-800 transition-all"
        >
          Explore Teams →
        </button>
      </main>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            navigate("/dashboard");
          }}
          openSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={() => {
            setShowSignup(false);
            navigate("/dashboard");
          }}
          openLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}