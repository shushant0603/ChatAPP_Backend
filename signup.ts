import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { register } from "../api/Auth/auth.routes";

type MessageType = "success" | "error";

const Register: React.FC = () => {
   const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);

    try {
      const response = await register(name, email, password);

      setMessage(response.data.message || "Registration successful 🎉");
      setMessageType("success");

       setName("");
       setEmail("");
       setPassword("");
      setTimeout(() => {
     navigate("/verify-otp", {
      state: {
       email: response.data.email || email,
     },
   });
   }, 1500);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage(
        err?.response?.data?.message ||
          "Registration failed , Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 auto-hide popup
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
      setMessageType(null);
  
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative">
      {/* Popup Message */}
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
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        {/* form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 rounded-lg bg-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold
              ${
                loading
                  ? "bg-slate-600"
                  : "bg-sky-400 text-black hover:bg-sky-300"
              }`}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
