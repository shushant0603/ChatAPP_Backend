import React, { useEffect, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { login } from "../api/Auth/auth.routes";

type MessageType = "success" | "error";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await login(email, password);
   

   
      const token = response.data?.token;
      
      if (!token) {
        console.error("Token not found in response!");
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", token);
      // console.log("Token saved in localStorage:", localStorage.getItem("token"));

      setMessage(response.data.message || "Login successful 🎉");
      setMessageType("success");

      // Navigate immediately after token is saved
      setTimeout(() => {
        navigate("/home");
      }, 1500);

  
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
          "Login failed ❌. Invalid credentials"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 auto hide popup
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative">
      {/* Popup */}
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg
            ${
              messageType === "success"
                ? "bg-green-500 text-black"
                : "bg-red-500 text-white"
            }`}
        >
          {message}
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-slate-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-slate-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition
              ${
                loading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-sky-400 text-black hover:bg-sky-300"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="px-4 text-slate-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Social Login */}
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 w-full border border-slate-700 py-2 rounded-lg hover:border-sky-400 transition">
            <FcGoogle size={22} /> Google
          </button>

          <button className="flex items-center justify-center gap-2 w-full border border-slate-700 py-2 rounded-lg hover:border-sky-400 transition">
            <FaGithub size={20} /> GitHub
          </button>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-sky-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
