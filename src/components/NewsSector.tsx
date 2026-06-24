import { useState } from "react";
import { NewsArticle } from "../types.js";
import { Globe, Trophy, Calendar, Sparkles, MapPin, Swords } from "lucide-react";

interface NewsSectorProps {
  news: NewsArticle[];
  onPrepTactics: (teamA: string, teamB: string) => void;
  isLoading: boolean;
}

export default function NewsSector({ news, onPrepTactics, isLoading }: NewsSectorProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "news" | "results" | "upcoming">("all");

  const internationalNews = news.filter((item) => item.type === "international");
  const matchResults = news.filter((item) => item.type === "match_result");
  const upcomingMatches = news.filter((item) => item.type === "upcoming");

  const filteredNews = () => {
    switch (activeCategory) {
      case "news":
        return internationalNews;
      case "results":
        return matchResults;
      case "upcoming":
        return upcomingMatches;
      default:
        return news;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4" />
        <p>Retrieving latest rugby files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="news-sector">
      {/* Sector Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-white flex flex-wrap items-center gap-2.5">
            Rugby News & <span className="text-amber-500 italic font-normal">Match Centre</span>
            <span className="text-amber-500 font-mono text-[9px] uppercase tracking-widest bg-[#151515] border border-amber-500/20 px-2 py-1 rounded-none">OVAL HUB</span>
          </h2>
          <p className="text-slate-450 text-xs mt-1 uppercase tracking-wider">
            Stay up to date with official test match fixtures, results, and major team announcements.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#0F0F0F] p-1 rounded-none border border-slate-700 self-start md:self-auto shrink-0">
          {(["all", "news", "results", "upcoming"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-none capitalize transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat === "all" ? "Show All" : cat === "news" ? "News" : cat === "results" ? "Results" : "Upcoming"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sub-Panel 1: International News (Spans 2 columns on large screens) */}
        {(activeCategory === "all" || activeCategory === "news") && (
          <div className={`${activeCategory === "all" ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-serif italic text-xl border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4" />
              <span>International Rugby News</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internationalNews.map((article) => (
                <div
                  key={article.id}
                  className="group relative flex flex-col justify-between p-5 bg-[#0F0F0F] border border-slate-800 rounded-none hover:border-amber-500/50 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-none">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDate(article.date)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-550 transition-colors font-sans leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-slate-450 text-xs mt-2.5 leading-relaxed">
                      {article.content}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="uppercase tracking-wider">Source: World Rugby</span>
                    <span className="text-amber-500 font-semibold uppercase tracking-wider group-hover:underline">Read Thread &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Panel 2: Past Matches / Results */}
        {(activeCategory === "all" || activeCategory === "results") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-serif italic text-xl border-b border-slate-800 pb-2">
              <Trophy className="w-4 h-4" />
              <span>Latest Results</span>
            </div>

            <div className="space-y-4">
              {matchResults.map((match) => (
                <div
                  key={match.id}
                  className="p-5 bg-[#0F0F0F] border border-slate-800 rounded-none hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-500 font-mono mb-3">
                    <span>{match.category}</span>
                    <span>{formatDate(match.date)}</span>
                  </div>

                  {/* Team A vs Team B Score Board */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col items-center w-[40%] text-center">
                      <div className="w-10 h-10 bg-[#151515] rounded-none flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-850 font-sans">
                        {match.teamA?.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="text-white text-xs font-bold mt-1.5 truncate w-full">{match.teamA}</span>
                    </div>

                    <div className="flex items-center gap-3 font-serif italic">
                      <span className={`text-2xl font-bold ${Number(match.scoreA) > Number(match.scoreB) ? "text-amber-500" : "text-slate-400"}`}>
                        {match.scoreA}
                      </span>
                      <span className="text-slate-600 text-xs font-sans uppercase tracking-widest">FT</span>
                      <span className={`text-2xl font-bold ${Number(match.scoreB) > Number(match.scoreA) ? "text-amber-500" : "text-slate-400"}`}>
                        {match.scoreB}
                      </span>
                    </div>

                    <div className="flex flex-col items-center w-[40%] text-center">
                      <div className="w-10 h-10 bg-[#151515] rounded-none flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-850 font-sans">
                        {match.teamB?.slice(0, 3).toUpperCase()}
                      </div>
                      <span className="text-white text-xs font-bold mt-1.5 truncate w-full">{match.teamB}</span>
                    </div>
                  </div>

                  <p className="text-slate-450 text-xs italic text-center mt-3 border-t border-slate-800/60 pt-2 bg-slate-950/40 py-1.5">
                    {match.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Panel 3: Upcoming Matches */}
        {(activeCategory === "all" || activeCategory === "upcoming") && (
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-serif italic text-xl border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Fixtures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col justify-between p-5 bg-[#0F0F0F] border border-slate-800 rounded-none hover:border-amber-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mb-3">
                      <span className="bg-[#151515] px-2.5 py-0.5 rounded-none text-slate-400 border border-slate-700/50 uppercase tracking-widest">
                        {match.category}
                      </span>
                      <span>{match.kickOff?.split(" - ")[0]}</span>
                    </div>

                    {/* Team Names and VS layout */}
                    <div className="flex items-center justify-center gap-4 py-4 border-b border-slate-800">
                      <span className="text-white font-bold text-xs text-right w-[42%] truncate">{match.teamA}</span>
                      <div className="px-2 py-0.5 bg-[#151515] text-amber-500 border border-slate-800 rounded-none font-mono text-[9px] uppercase font-bold tracking-widest shrink-0">
                        VS
                      </div>
                      <span className="text-white font-bold text-xs text-left w-[42%] truncate">{match.teamB}</span>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-1.5 text-slate-450 text-[10px] mt-3 font-sans uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>

                  {/* Tactical Prep CTA */}
                  <div className="mt-5">
                    <button
                      onClick={() => onPrepTactics(match.teamA || "Team A", match.teamB || "Team B")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#151515] hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 hover:border-amber-500 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
                    >
                      <Swords className="w-4 h-4" />
                      <span>Prepare Tactics Pitch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
