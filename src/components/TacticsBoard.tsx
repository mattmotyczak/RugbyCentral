import React, { useState, useEffect, useRef } from "react";
import { RugbyPlayer, OnFieldPlayer, TacticBoard } from "../types.js";
import { 
  Save, 
  Share2, 
  Info, 
  RefreshCw, 
  PlusCircle, 
  FileText, 
  Sparkles, 
  UserPlus, 
  Twitter, 
  Facebook, 
  Check, 
  Download,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface TacticsBoardProps {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  token: string | null;
  currentUser: { id: string; username: string } | null;
  preloadedTeams?: { teamA: string; teamB: string } | null;
}

const RUGBY_UNION_ROLES = [
  { role: "Prop 1", label: "1. Loosehead Prop", defaultX: 30, defaultY: 30 },
  { role: "Hooker", label: "2. Hooker", defaultX: 50, defaultY: 28 },
  { role: "Prop 3", label: "3. Tighthead Prop", defaultX: 70, defaultY: 30 },
  { role: "Lock 4", label: "4. Left Lock", defaultX: 42, defaultY: 20 },
  { role: "Lock 5", label: "5. Right Lock", defaultX: 58, defaultY: 20 },
  { role: "Flanker 6", label: "6. Blindside Flanker", defaultX: 28, defaultY: 14 },
  { role: "Flanker 7", label: "7. Openside Flanker", defaultX: 72, defaultY: 14 },
  { role: "No. 8", label: "8. Number 8", defaultX: 50, defaultY: 11 },
  { role: "Scrum-half", label: "9. Scrum-half", defaultX: 42, defaultY: 42 },
  { role: "Fly-half", label: "10. Fly-half", defaultX: 55, defaultY: 52 },
  { role: "Winger 11", label: "11. Left Winger", defaultX: 18, defaultY: 62 },
  { role: "Centre 12", label: "12. Inside Centre", defaultX: 42, defaultY: 62 },
  { role: "Centre 13", label: "13. Outside Centre", defaultX: 58, defaultY: 68 },
  { role: "Winger 14", label: "14. Right Winger", defaultX: 82, defaultY: 62 },
  { role: "Full-back", label: "15. Full-back", defaultX: 50, defaultY: 82 }
];

const RUGBY_SEVENS_ROLES = [
  { role: "Prop 1", label: "1. Prop Left", defaultX: 30, defaultY: 25 },
  { role: "Hooker", label: "2. Hooker", defaultX: 50, defaultY: 22 },
  { role: "Prop 3", label: "3. Prop Right", defaultX: 70, defaultY: 25 },
  { role: "Scrum-half", label: "4. Scrum-half", defaultX: 45, defaultY: 45 },
  { role: "Fly-half", label: "5. Fly-half", defaultX: 55, defaultY: 55 },
  { role: "Centre", label: "6. Utility Centre", defaultX: 32, defaultY: 68 },
  { role: "Winger", label: "7. Speed Winger", defaultX: 68, defaultY: 68 }
];

export default function TacticsBoard({
  isLoggedIn,
  onOpenAuth,
  token,
  currentUser,
  preloadedTeams
}: TacticsBoardProps) {
  const [formationType, setFormationType] = useState<"15-union" | "7-sevens">("15-union");
  const [boardName, setBoardName] = useState("Championship Defensive Setup");
  const [playersOnField, setPlayersOnField] = useState<OnFieldPlayer[]>([]);
  const [playersPool, setPlayersPool] = useState<RugbyPlayer[]>([]);
  const [selectedFieldPlayerId, setSelectedFieldPlayerId] = useState<string | null>(null);
  const [notes, setNotes] = useState("Focus on drift-defense channels at 10m mark. Ensure Hooker covers blindside sweeps.");
  const [savedBoards, setSavedBoards] = useState<TacticBoard[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedData, setExportedData] = useState<any | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);

  // Prepopulate or sync preloaded names from upcoming fixtures
  useEffect(() => {
    if (preloadedTeams) {
      setBoardName(`Match Prep: ${preloadedTeams.teamA} vs ${preloadedTeams.teamB}`);
      setNotes(`Tactical walkthrough notes for preparing the game layout between ${preloadedTeams.teamA} and ${preloadedTeams.teamB}. Drag and drop players to map scrums or lineouts.`);
    }
  }, [preloadedTeams]);

  // Load players pool & saved tactical boards
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available players
      const playerHeaders: Record<string, string> = {};
      if (token) {
        playerHeaders["Authorization"] = `Bearer ${token}`;
      }
      const playerRes = await fetch("/api/tactics/players", { headers: playerHeaders });
      if (playerRes.ok) {
        const pData = await playerRes.json();
        setPlayersPool(pData.players);
      }

      // 2. Fetch saved tactical boards (if logged in)
      if (isLoggedIn && token) {
        const boardRes = await fetch("/api/tactics/boards", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (boardRes.ok) {
          const bData = await boardRes.json();
          setSavedBoards(bData.boards);
        }
      }
    } catch (err) {
      console.error("Error fetching tactics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isLoggedIn, token]);

  // Reset formation preset
  const resetFormation = (type: "15-union" | "7-sevens") => {
    const roles = type === "15-union" ? RUGBY_UNION_ROLES : RUGBY_SEVENS_ROLES;
    const initialFieldPlayers: OnFieldPlayer[] = roles.map((roleInfo, index) => {
      // Match with an appropriate player from pool based on position index
      const matchedPlayer = playersPool.find((p) => 
        p.position.toLowerCase().includes(roleInfo.role.split(" ")[0].toLowerCase()) ||
        p.position.toLowerCase().includes(roleInfo.role.toLowerCase())
      );

      return {
        id: `field-${index}-${Date.now()}`,
        name: matchedPlayer ? matchedPlayer.name : "Select Player",
        position: matchedPlayer ? matchedPlayer.position : roleInfo.role,
        roleName: roleInfo.role,
        x: roleInfo.defaultX,
        y: roleInfo.defaultY,
      };
    });

    setPlayersOnField(initialFieldPlayers);
    setSelectedFieldPlayerId(null);
  };

  // Trigger initial formation load once playersPool is available
  useEffect(() => {
    if (playersPool.length > 0 && playersOnField.length === 0) {
      resetFormation(formationType);
    }
  }, [playersPool]);

  // Handle Drag / Pointer Down on Player node
  const handlePointerDown = (e: React.PointerEvent, playerFieldId: string) => {
    e.preventDefault();
    setDraggedPlayerId(playerFieldId);
    setSelectedFieldPlayerId(playerFieldId);
    if (pitchRef.current) {
      pitchRef.current.setPointerCapture(e.pointerId);
    }
  };

  // Handle Dragging Movement over Pitch
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedPlayerId || !pitchRef.current) return;
    
    const rect = pitchRef.current.getBoundingClientRect();
    // Compute percentage relative to field bounds
    let pctX = ((e.clientX - rect.left) / rect.width) * 100;
    let pctY = ((e.clientY - rect.top) / rect.height) * 100;

    // Apply strict field boundaries (clamp 3% to 97%)
    pctX = Math.max(3, Math.min(97, pctX));
    pctY = Math.max(3, Math.min(97, pctY));

    setPlayersOnField((prev) =>
      prev.map((p) => (p.id === draggedPlayerId ? { ...p, x: Math.round(pctX), y: Math.round(pctY) } : p))
    );
  };

  // Handle Drag End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedPlayerId) {
      setDraggedPlayerId(null);
      if (pitchRef.current) {
        pitchRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Assign a player from pool to the selected slot
  const handleAssignPlayer = (poolPlayer: RugbyPlayer) => {
    if (!selectedFieldPlayerId) return;

    setPlayersOnField((prev) =>
      prev.map((p) =>
        p.id === selectedFieldPlayerId
          ? { ...p, name: poolPlayer.name, position: poolPlayer.position }
          : p
      )
    );
  };

  // Save tactical board configuration to database
  const handleSaveBoard = async () => {
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }

    if (!boardName.trim()) {
      setErrorMsg("Please provide a playbook title.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/tactics/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: boardName,
          formation: formationType,
          playersOnField,
          notes
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save tactical setup.");
      }

      setSuccessMsg("Tactical board saved successfully!");
      loadData(); // Reload saved list
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Load a saved tactical layout
  const handleLoadSavedBoard = (saved: TacticBoard) => {
    setBoardName(saved.name);
    setFormationType(saved.formation as any);
    setPlayersOnField(saved.playersOnField);
    setNotes(saved.notes || "");
    setSuccessMsg(`Successfully loaded "${saved.name}" setup!`);
    setSelectedFieldPlayerId(null);
  };

  // Export board and mock social media post
  const handleExportShare = async (platform: "twitter" | "facebook" | "whatsapp") => {
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    // Save first to get dynamic tracking representation
    setLoading(true);
    try {
      // Create/Save current board state first
      const saveRes = await fetch("/api/tactics/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: boardName,
          formation: formationType,
          playersOnField,
          notes
        })
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Save required before sharing.");
      }

      // Trigger Share API endpoint which checks session auth
      const shareRes = await fetch("/api/tactics/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          boardId: saveData.board.id,
          platform
        })
      });

      const shareData = await shareRes.json();
      if (!shareRes.ok) {
        throw new Error(shareData.error || "Sharing permissions expired.");
      }

      setExportedData(shareData);
      setExportModalOpen(true);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not process visual share.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tactics-creator-sector">
      {/* Sector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-white flex flex-wrap items-center gap-2.5">
            Rugby Tactics <span className="text-amber-500 italic font-normal">Creator</span>
            <span className="text-amber-500 font-mono text-[9px] bg-[#151515] border border-amber-500/20 px-2 py-1 rounded-none uppercase tracking-widest">APP SECTOR</span>
          </h2>
          <p className="text-slate-455 text-xs mt-1 uppercase tracking-wider">
            Build playbooks, drag tokens, map defensive schemes, and save custom tactical board configurations.
          </p>
        </div>

        {/* Formation Presets Selection */}
        <div className="flex bg-[#0F0F0F] p-1 rounded-none border border-slate-700 shrink-0 self-start md:self-auto">
          <button
            onClick={() => {
              setFormationType("15-union");
              resetFormation("15-union");
            }}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
              formationType === "15-union"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Rugby Union (15s)
          </button>
          <button
            onClick={() => {
              setFormationType("7-sevens");
              resetFormation("7-sevens");
            }}
            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
              formationType === "7-sevens"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Rugby Sevens (7s)
          </button>
        </div>
      </div>

      {/* Control Info/Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-none text-xs uppercase tracking-wider font-bold flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-none text-xs uppercase tracking-wider font-bold flex items-center gap-2">
          <Info className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Double Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Spans 8 cols): Interactive Grass Pitch Board */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Tactical Config Input Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0F0F0F] p-3 rounded-none border border-slate-800">
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Draft Strategy Title..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none text-xs font-bold uppercase tracking-wider transition-all"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBoard}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none text-xs uppercase tracking-widest transition-all cursor-pointer shadow disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Setup</span>
              </button>
              <button
                onClick={() => resetFormation(formationType)}
                className="p-2.5 bg-slate-950 hover:bg-[#151515] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-none transition-colors cursor-pointer"
                title="Reset Coordinates"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Field Map Wrapper */}
          <div className="relative border border-slate-800 rounded-none overflow-hidden bg-slate-950">
            <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800/80 px-2.5 py-1 rounded-none text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Drag Player Badges to Reorganize Setup</span>
            </div>

            {/* Visual Pitch Outer Stage */}
            <div 
              ref={pitchRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] select-none touch-none overflow-hidden"
              style={{ background: "#0E0E0E" }}
            >
              {/* Rugby Grass Striping (12 vertical stripes) */}
              <div className="absolute inset-0 flex flex-col h-full w-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 w-full ${i % 2 === 0 ? "field-stripe-light" : "field-stripe-dark"}`} 
                  />
                ))}
              </div>

              {/* Chalk Field Markings */}
              {/* Outer Boundary line */}
              <div className="absolute top-[4%] bottom-[4%] left-[4%] right-[4%] border-[1.5px] border-white/40 pointer-events-none" />
              
              {/* Half-way chalk line */}
              <div className="absolute top-[50%] left-[4%] right-[4%] h-[1.5px] bg-white/40 pointer-events-none" />
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-[1.5px] border-white/30 pointer-events-none" />

              {/* Attacking 22m Lines */}
              <div className="absolute top-[26%] left-[4%] right-[4%] h-[1px] border-t border-dashed border-white/35 pointer-events-none" />
              <div className="absolute bottom-[26%] left-[4%] right-[4%] h-[1px] border-t border-dashed border-white/35 pointer-events-none" />
              
              {/* Attacking 10m Lines */}
              <div className="absolute top-[40%] left-[4%] right-[4%] h-[1px] border-t border-dashed border-white/25 pointer-events-none" />
              <div className="absolute bottom-[40%] left-[4%] right-[4%] h-[1px] border-t border-dashed border-white/25 pointer-events-none" />

              {/* Gold Rugby H-Goalposts (Top and Bottom Try Zones) */}
              {/* Top Goal Post */}
              <div className="absolute top-[4%] left-1/2 -translate-x-1/2 -translate-y-[2%] flex flex-col items-center pointer-events-none z-10">
                <div className="flex justify-between w-14 h-8 border-b-2 border-x-2 border-yellow-500/80">
                  <div className="w-[1.5px] bg-yellow-500/80 h-12 -mt-4" />
                  <div className="w-[1.5px] bg-yellow-500/80 h-12 -mt-4" />
                </div>
              </div>

              {/* Bottom Goal Post */}
              <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 translate-y-[2%] flex flex-col items-center pointer-events-none z-10">
                <div className="flex justify-between w-14 h-8 border-t-2 border-x-2 border-yellow-500/80">
                  <div className="w-[1.5px] bg-yellow-500/80 h-12 -mb-4" />
                  <div className="w-[1.5px] bg-yellow-500/80 h-12 -mb-4" />
                </div>
              </div>

              {/* Chalk Field Labels */}
              <div className="absolute top-[5.5%] left-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-wider select-none pointer-events-none">Try Zone</div>
              <div className="absolute bottom-[5.5%] left-6 text-[10px] font-mono font-bold text-white/30 uppercase tracking-wider select-none pointer-events-none">Try Zone</div>
              <div className="absolute top-[27%] right-6 text-[10px] font-mono text-white/25 uppercase select-none pointer-events-none">22m Line</div>
              <div className="absolute bottom-[27%] right-6 text-[10px] font-mono text-white/25 uppercase select-none pointer-events-none">22m Line</div>
              <div className="absolute top-[48.5%] left-6 text-[10px] font-mono text-white/35 uppercase select-none pointer-events-none">Halfway</div>

              {/* Draggable Player Tokens */}
              {playersOnField.map((player) => {
                const isSelected = selectedFieldPlayerId === player.id;
                const isForward = [
                  "prop", "hooker", "lock", "flanker", "8"
                ].some((fwType) => player.roleName.toLowerCase().includes(fwType));

                return (
                  <div
                    key={player.id}
                    onPointerDown={(e) => handlePointerDown(e, player.id)}
                    className="absolute cursor-grab active:cursor-grabbing z-20 -translate-x-1/2 -translate-y-1/2 transition-shadow"
                    style={{ left: `${player.x}%`, top: `${player.y}%` }}
                  >
                    <div 
                      className={`relative flex flex-col items-center p-0.5 rounded-full transition-all duration-150 ${
                        isSelected 
                          ? "ring-2 ring-yellow-400 scale-110 shadow-lg shadow-yellow-500/30" 
                          : "hover:scale-105"
                      }`}
                    >
                      {/* Round Player Badge */}
                      <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-md border ${
                        isForward 
                          ? "bg-slate-900 border-amber-500/60" 
                          : "bg-slate-950 border-sky-500/50"
                      }`}>
                        <span className="text-xs font-mono font-bold">
                          {player.roleName.replace(/\D/g, "") || player.roleName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Info Floating Label */}
                      <div className="absolute top-11 bg-slate-950/90 border border-slate-800 text-[10px] font-semibold text-slate-100 rounded px-2 py-0.5 whitespace-nowrap shadow-md max-w-[85px] truncate text-center">
                        {player.name.split(" ").slice(-1)[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Notes Input Panel */}
          <div className="p-4 bg-[#0F0F0F] rounded-none border border-slate-800 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-450 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Coach's Playbook Instructions & Strategy Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail specific team alignments, kick strategies, lineout codes..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-700 outline-none text-xs leading-relaxed"
            />
          </div>

        </div>

        {/* Right Column (Spans 4 cols): Player Selection & Board Share Drawer */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section A: Selected Slot Configuration & Selection */}
          <div className="p-4 bg-[#0F0F0F] border border-slate-800 rounded-none space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 font-serif border-b border-slate-800 pb-2.5">
              <UserPlus className="w-4 h-4" />
              <span>Assign Player to Field Position</span>
            </h3>

            {selectedFieldPlayerId ? (
              (() => {
                const activeOnField = playersOnField.find((p) => p.id === selectedFieldPlayerId);
                if (!activeOnField) return null;

                return (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-none">
                      <div className="text-[9px] font-mono text-amber-500 font-bold uppercase mb-0.5">Selected Spot:</div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">{activeOnField.roleName}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Currently filled by: <strong className="text-slate-200">{activeOnField.name}</strong></div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450">
                        Select a Rugby Player to Fill Role:
                      </label>
                      
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2 border border-slate-950 bg-slate-950/50 p-1.5 rounded-none">
                        {playersPool.map((poolPlayer) => (
                          <button
                            key={poolPlayer.id}
                            onClick={() => handleAssignPlayer(poolPlayer)}
                            className="w-full flex items-center justify-between p-2 hover:bg-[#151515] rounded-none border border-transparent hover:border-slate-850 text-left transition-all group cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate">{poolPlayer.name}</div>
                              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{poolPlayer.position} &bull; {poolPlayer.club}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {poolPlayer.isCustom && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-none">CUSTOM</span>
                              )}
                              <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-none border border-amber-500/20">
                                {poolPlayer.rating}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 text-center bg-slate-950 border border-slate-950 rounded-none text-slate-500 text-xs">
                <Info className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                <span>Click or tap any player circle on the field to assign squad members or update coordinates.</span>
              </div>
            )}
          </div>

          {/* Section B: Social Media Export & Share Option */}
          <div className="p-4 bg-[#0F0F0F] border border-slate-800 rounded-none space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 font-serif border-b border-slate-800 pb-2.5">
              <Share2 className="w-4 h-4" />
              <span>Export & Share Tactical Board</span>
            </h3>

            <p className="text-xs text-slate-455 leading-relaxed">
              Export high-fidelity snapshots of your tactical boards to social feeds.
            </p>

            {isLoggedIn ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExportShare("twitter")}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-850 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 text-xs rounded-none transition-all cursor-pointer"
                >
                  <Twitter className="w-4 h-4 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">Twitter</span>
                </button>
                <button
                  onClick={() => handleExportShare("facebook")}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-850 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 text-xs rounded-none transition-all cursor-pointer"
                >
                  <Facebook className="w-4 h-4 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">Facebook</span>
                </button>
                <button
                  onClick={() => handleExportShare("whatsapp")}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-850 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 text-xs rounded-none transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 mb-1" />
                  <span className="text-[9px] uppercase tracking-wider font-bold">WhatsApp</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-none text-center space-y-2">
                <p className="text-[10px] text-amber-200 uppercase tracking-wide leading-relaxed">
                  🔒 Exporting screenshots is restricted to logged-in users only.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-amber-500 hover:text-white uppercase tracking-wider underline cursor-pointer"
                >
                  Sign In to Export & Share &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Section C: Saved Tactics Feed */}
          {isLoggedIn && savedBoards.length > 0 && (
            <div className="p-4 bg-[#0F0F0F] border border-slate-800 rounded-none space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-450 flex items-center gap-1.5 font-serif border-b border-slate-800 pb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>My Saved Tactical Setups</span>
              </h3>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {savedBoards.map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => handleLoadSavedBoard(saved)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-[#151515] border border-slate-850 hover:border-amber-500/20 rounded-none text-left text-xs text-slate-300 hover:text-amber-500 transition-all group cursor-pointer"
                  >
                    <span className="font-semibold uppercase tracking-wider truncate pr-2">{saved.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Export / Mock Sharing Modal Overlay */}
      {exportModalOpen && exportedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-xl overflow-hidden rounded-none border border-amber-500/40 bg-slate-950 text-slate-100 shadow-2xl">
            <div className="h-1 bg-amber-500 w-full" />
            
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  <h4 className="text-base font-bold uppercase tracking-widest text-white font-serif">Tactical Board Share Package</h4>
                </div>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Simulated Card Preview (PNG mockup representation) */}
              <div className="p-5 bg-[#0F0F0F] border border-slate-800 rounded-none space-y-4 shadow-inner relative overflow-hidden">
                {/* Glowing Rugby Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-serif font-black text-[80px] pointer-events-none uppercase tracking-widest leading-none">
                  OVAL
                </div>

                <div className="flex justify-between items-start border-b border-slate-800 pb-2.5 z-10 relative">
                  <div>
                    <h5 className="text-base font-bold text-amber-400 uppercase tracking-wider font-sans">{boardName}</h5>
                    <p className="text-[9px] font-mono text-slate-500">FORMAT: {formationType === "15-union" ? "RUGBY UNION 15s" : "RUGBY SEVENS 7s"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono px-2 py-0.5 bg-[#151515] border border-slate-700 text-slate-400 rounded-none">
                      PREVIEW_OK
                    </span>
                  </div>
                </div>

                {/* mini pitch canvas visual */}
                <div className="grid grid-cols-5 gap-2.5 py-4 border-b border-slate-800 relative z-10">
                  {playersOnField.map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-slate-950 p-1 rounded-none border border-slate-850">
                      <span className="text-[9px] font-mono font-bold text-amber-500">{p.roleName}</span>
                      <span className="text-[10px] text-slate-200 truncate max-w-full font-sans font-medium">{p.name.split(" ").slice(-1)[0]}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 leading-relaxed italic relative z-10 bg-slate-950/80 p-2.5 rounded-none border border-slate-850">
                  {notes || "No coach playbook instructions provided."}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 relative z-10">
                  <span>Created by Coach: @{exportedData.user}</span>
                  <span>OVALTACTICS APP &bull; {new Date(exportedData.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status report */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-none text-xs space-y-1">
                <p className="font-bold uppercase tracking-wider">Social Share Successful!</p>
                <p className="text-slate-400">Export verified using cryptographic security token signature: <code className="text-amber-500 bg-slate-950 px-1 py-0.2 rounded-none font-mono break-all">{exportedData.shareUrl}</code></p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify({ boardName, formationType, playersOnField, notes }, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${boardName.toLowerCase().replace(/\s+/g, "_")}_tactic_setup.json`;
                    link.click();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => setExportModalOpen(false)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
