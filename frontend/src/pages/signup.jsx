import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

const BG_IMAGE = '/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm00MjktMTMyLmpwZw.webp'

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    signUp(name.trim(), email.trim());
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-6">
      <img src={BG_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: '#f5e0b5', fontFamily: 'serif', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Create Account</h2>
          <p className="text-sm mt-1" style={{ color: '#c4b08a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Start your adventure</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="text"
            className="w-full rounded-lg p-3 border focus:outline-none"
            style={{ background: 'rgba(30,20,12,0.6)', borderColor: 'rgba(196,176,138,0.4)', color: '#f5e0b5' }}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            className="w-full rounded-lg p-3 border focus:outline-none"
            style={{ background: 'rgba(30,20,12,0.6)', borderColor: 'rgba(196,176,138,0.4)', color: '#f5e0b5' }}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm" style={{ color: '#ff6b55' }}>{error}</p>}
          <button type="submit"
            className="w-full font-semibold py-3 rounded-lg transition hover:scale-105"
            style={{ background: 'rgba(245,224,181,0.85)', color: '#3e2c14', fontFamily: 'serif', letterSpacing: '1px' }}>
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm" style={{ color: '#c4b08a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          Already have an account?{' '}
          <Link to="/signin" className="hover:underline font-semibold" style={{ color: '#f5e0b5' }}>Sign in</Link>
        </p>
        <Link to="/" className="hover:underline text-xs" style={{ color: '#8a7a5a', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>&larr; Back to home</Link>
      </div>
    </div>
  );
}
