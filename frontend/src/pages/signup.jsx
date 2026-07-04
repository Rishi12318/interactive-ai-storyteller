import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

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
    <div className="relative min-h-screen flex items-center justify-center p-6" style={{ background: '#f0e8dc' }}>
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: '#6a5a4a', fontFamily: 'serif' }}>Create Account</h2>
          <p className="text-sm mt-1" style={{ color: '#9a8a7a' }}>Start your adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text" placeholder="Name" value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            className="w-full px-5 py-3 rounded-xl text-base outline-none transition-all duration-200"
            style={{ background: '#e8dccc', color: '#5a4a3a', border: '1px solid #d8ccbc' }}
          />
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
            Create Account
          </button>
        </form>

        <p className="text-sm" style={{ color: '#9a8a7a' }}>
          Already have an account? <Link to="/signin" className="font-medium" style={{ color: '#8a7a6a' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
