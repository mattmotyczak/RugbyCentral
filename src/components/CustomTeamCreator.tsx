import React, { useState, useEffect } from "react";
import { RugbyPlayer } from "../types.js";
import { Plus, User, Award, Shield, Globe, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

interface CustomTeamCreatorProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  token: string | null;
}

const RUGBY_POSITIONS = [
  "Prop",
  "Hooker",
  "Lock",
  "Flanker",
  "Number 8",
  "Scrum-half",
  "Fly-half",
  "Centre",
  "Winger",
  "Full-back"
];

export default function CustomTeamCreator({ isLoggedIn, onOpenAuth, token }: CustomTeamCreatorProps) {
  const [customPlayers, setCustomPlayers] = useState<RugbyPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [position, setPosition] = useState("Fly-half");
  const [rating, setRating] = useState("85");
  const [club, setClub] = useState("");
  const [country, setCountry] = useState("");

  const loadCustomPlayers = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const response = await fetch("/api/tactics/players", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter to only user's custom players
        const userCustom = data.players.filter((p: RugbyPlayer) => p.isCustom);
        setCustomPlayers(userCustom);
      }
    } catch (err) {
      console.error("Failed to load custom players roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomPlayers();
  }, [isLoggedIn, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }

    if (!name.trim()) {
      setError("Please specify a player name.");
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 99) {
      setError("Rating must be a whole number between 1 and 99.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/tactics/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          position,
          rating: numRating,
          club: club.trim() || "Independent",
          country: country.trim() || "National Team Draft"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create player.");
      }

      setSuccess(`Rugby player "${data.player.name}" successfully drafted!`);
      setName("");
      setClub("");
      setCountry("");
      loadCustomPlayers(); // Reload custom roster
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="custom-team-sector">
      {/* Sector Header */}
      <div className="border-b border-slate-700 pb-5">
        <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-white flex flex-wrap items-center gap-2.5">
          Custom Squad <span className="text-amber-500 italic font-normal">Draft & Database</span>
          <span className="text-amber-500 font-mono text-[9px] uppercase tracking-widest bg-[#151515] border border-amber-500/20 px-2 py-1 rounded-none">DATABASE</span>
        </h2>
        <p className="text-slate-455 text-xs mt-1 uppercase tracking-wider">
          Draft custom amateur or professional rugby players, define stats, and manage rosters for tactical setups.
        </p>
      </div>

      {!isLoggedIn ? (
        <div className="p-10 text-center border border-slate-800 bg-[#0F0F0F] rounded-none max-w-xl mx-auto space-y-4 shadow-xl">
          <div className="p-4 bg-amber-500/10 rounded-none w-14 h-14 mx-auto flex items-center justify-center border border-amber-500/20">
            <Plus className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-serif">Drafting Locked</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            You must be logged in to access the custom players database and create players. Logged-in credentials let you draft private players that sync directly with the interactive playbooks.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-amber-500 hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer shadow"
          >
            Sign In / Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side (5 columns) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 p-6 bg-[#0F0F0F] border border-slate-800 rounded-none space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-serif">Player Draft Sheet</h3>
            </div>

            {success && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-none text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-none text-xs uppercase tracking-wider font-bold">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                Player Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonah Lomu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                  Primary Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-200 outline-none text-xs uppercase tracking-wider font-bold"
                >
                  {RUGBY_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                  Overall Rating (1-99)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                  Club Affiliation
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    placeholder="e.g. Leinster"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                  Country Represented
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. New Zealand"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none transition-all text-xs uppercase tracking-widest shadow cursor-pointer disabled:opacity-50"
            >
              {loading ? "Drafting..." : "Draft Player"}
            </button>
          </form>

          {/* Roster View Side (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 flex items-center gap-1.5 font-serif">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>My Drafted Roster ({customPlayers.length} Players)</span>
              </h3>
              <button
                onClick={loadCustomPlayers}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh database roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading && customPlayers.length === 0 ? (
              <div className="p-10 text-center bg-[#0F0F0F] border border-slate-800 rounded-none">
                <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-amber-500 mx-auto" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-2">Connecting roster files...</p>
              </div>
            ) : customPlayers.length === 0 ? (
              <div className="p-10 text-center bg-[#0F0F0F] border border-slate-800 rounded-none text-slate-500 text-xs">
                <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-bold uppercase tracking-wider text-slate-400">No custom players drafted yet.</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Use the left panel draft sheet to build your private roster database!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-2">
                {customPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 bg-[#0F0F0F] border border-slate-800/85 rounded-none flex items-center justify-between hover:border-amber-500/30 transition-all shadow-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white uppercase tracking-wider truncate">{player.name}</div>
                      <div className="text-[10px] font-bold text-amber-500 font-mono mt-0.5 uppercase tracking-widest">{player.position}</div>
                      
                      <div className="flex gap-2 text-[9px] uppercase tracking-wider text-slate-500 mt-2 font-mono truncate">
                        <span>Club: <strong className="text-slate-350">{player.club}</strong></span>
                        <span>&bull;</span>
                        <span>Rep: <strong className="text-slate-350">{player.country}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-none bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-amber-500 font-mono leading-none">{player.rating}</span>
                        <span className="text-[7px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">OVR</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
