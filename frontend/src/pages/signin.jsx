import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    signIn(email.trim());
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6" style={{ background: '#f0e8dc' }}>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: '#6a5a4a', fontFamily: 'serif' }}>Welcome Back</h2>
          <p className="text-sm mt-1" style={{ color: '#9a8a7a' }}>Sign in to continue your story</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full px-5 py-3 rounded-xl text-base outline-none transition-all duration-200"
            style={{ background: '#e8dccc', color: '#5a4a3a', border: '1px solid #d8ccbc' }}
          />
          {error && <p className="text-sm" style={{ color: '#c07060' }}>{error}</p>}
          <button type="submit"
            className="w-full py-3 rounded-xl text-base font-medium tracking-wide transition-all duration-300 hover:opacity-90"
            style={{ background: '#d4c4b0', color: '#5a4a3a' }}>
            Sign In
          </button>
        </form>

        <p className="text-sm" style={{ color: '#9a8a7a' }}>
          New here? <Link to="/signup" className="font-medium" style={{ color: '#8a7a6a' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
