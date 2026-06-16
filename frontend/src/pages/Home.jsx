import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom"; // Added Navigate
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
        const res = await axios.get(
          "http://localhost:5001/user/me",
          {
            withCredentials: true,
          }
        );

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
      <div className="min-h-screen bg-[#15161c] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If user is already logged in, seamlessly forward them to the Dashboard view
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================
  // LANDING PAGE (Unauthenticated)
  // ==========================
  return (
    <div className="min-h-screen bg-[#15161c] text-white relative overflow-hidden">
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <nav className="flex items-center justify-between px-12 md:px-20 py-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Sync<span className="text-blue-400">UP</span>
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => setShowSignup(true)}
            className="px-6 py-2 rounded-full border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black transition-all duration-300"
          >
            Sign Up
          </button>

          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-2 rounded-full border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black transition-all duration-300"
          >
            Login
          </button>
        </div>
      </nav>

      <section className="px-12 md:px-20 pt-24 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">
            Finding Teams
            <br />
            is easy now.
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl">
            Connect with developers, designers,
            AI enthusiasts and builders
            for your next project.
          </p>

          <button
            onClick={() => navigate("/dashboard")} // Keeps routing within intent
            className="mt-16 px-10 py-4 border-2 border-white rounded-xl text-xl font-semibold hover:bg-white hover:text-black transition-all duration-300"
          >
            Explore Teams
          </button>
        </div>
      </section>

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
            }
          }
          openLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }
          }
        />
      )}
    </div>
  );
}