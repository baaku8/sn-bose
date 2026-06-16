import { useState } from "react";
import axios from "axios";

export default function SignupModal({onClose, onSuccess, openLogin,}) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try{
                await axios.post(
                "http://localhost:5001/api/signup",
            {
                firstName,
                lastName,
                email,
                password,
            },
            {
                withCredentials: true,
            }
            );

            onSuccess();
        }
        catch (err){
            alert(
            err.response?.data?.message ||
                "Failed to create account"
            );
        }
    };

    return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-[420px] shadow-2xl">
        <h2 className="text-3xl font-bold mb-6">
            Create Account
        </h2>

        <div className="mb-4">
            <label className="block mb-2 text-slate-300">
            First Name
            </label>
            <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
        </div>

        <div className="mb-4">
            <label className="block mb-2 text-slate-300">
            Last Name
            </label>
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
        </div>

        <div className="mb-4">
            <label className="block mb-2 text-slate-300">
            Email
            </label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
        </div>

        <div className="mb-6">
            <label className="block mb-2 text-slate-300">
            Password
            </label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
        </div>

        <button
            onClick={handleSignup}
            className="w-full bg-blue-500 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
        >
            Create Account
        </button>

        <p className="text-center text-slate-400 mt-4">
            Already have an account?{" "}
            <button
                onClick={openLogin}
                className="text-blue-400 hover:underline"
            >
            Login
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