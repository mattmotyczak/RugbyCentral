import React, { useState } from "react";
import { X, Lock, User, AlertCircle, Sparkles, Check } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: { id: string; username: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred. Please try again.");
      }

      onSuccess(data.token, data.user);
      onClose();
      // Clear fields
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-none border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl"
        id="auth-modal-card"
      >
        {/* Gold Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 w-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 transition-colors"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-amber-500/10 rounded-none border border-amber-500/30">
              <Sparkles className="w-8 h-8 text-amber-500 gold-glow" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center tracking-tighter font-serif">
            {isRegister ? "Join the Scrum" : "Welcome Back"}
          </h3>
          <p className="text-slate-455 text-xs text-center mt-1 uppercase tracking-wider">
            {isRegister 
              ? "Register an account to publish tactical playbooks and share analysis." 
              : "Sign in to access custom squads and export tactics."}
          </p>

          {/* Toggle Tabs */}
          <div className="flex mt-6 bg-[#0F0F0F] p-1 rounded-none border border-slate-800">
            <button
              type="button"
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
                !isRegister 
                  ? "bg-amber-500 text-slate-950 shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
                isRegister 
                  ? "bg-amber-500 text-slate-950 shadow-md" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-none text-xs uppercase tracking-wider font-bold">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-455 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ScrumHalf09"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-455 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                />
              </div>
            </div>

            {isRegister && (
              <div className="p-3.5 bg-slate-950 rounded-none border border-slate-800 space-y-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                <p className="font-semibold text-slate-350">Basic Security Protections:</p>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                  <span>Passwords hashed using HMAC-SHA256 with salts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stateless session token verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rate limited to defend against brute-force attacks</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none transition-all shadow-md text-xs uppercase tracking-widest mt-2 cursor-pointer"
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Access Platform"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
