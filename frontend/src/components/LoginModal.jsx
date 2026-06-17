import { useState } from "react";
import axios from "axios";

export default function LoginModal({ onClose, onSuccess, openSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // 🧪 TEMPORARY TEST BYPASS
    if (email === "abc@gmail.com" && password === "12345678") {
      onSuccess(); // Instantly closes modal and navigates to /dashboard
      return;
    }

    try {
      await axios.post(
        "http://localhost:5001/api/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-[420px] shadow-2xl">
        <h2 className="text-3xl font-bold mb-6">Login</h2>

        <div className="mb-4">
          <label className="block mb-2 text-slate-300">Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-slate-300">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
        >
          Login
        </button>

        <p className="text-center text-slate-400 mt-4">
          Don't have an account?{" "}
          <button
            onClick={openSignup}
            className="text-blue-400 hover:underline"
          >
            Sign Up
          </button>
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-lg border border-slate-700 hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}