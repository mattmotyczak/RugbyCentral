import React, { useState } from "react";
import { Post, Comment } from "../types.js";
import { MessageSquare, ThumbsUp, Plus, Send, ShieldAlert, Sparkles, Filter, Check } from "lucide-react";

interface ForumSectorProps {
  posts: Post[];
  isLoggedIn: boolean;
  currentUser: { id: string; username: string } | null;
  onVote: (postId: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onAddPost: (post: { title: string; content: string; type: "general" | "analysis"; category: "news" | "tactics" | "transfers" | "general" }) => Promise<void>;
  onOpenAuth: () => void;
}

export default function ForumSector({
  posts,
  isLoggedIn,
  currentUser,
  onVote,
  onComment,
  onAddPost,
  onOpenAuth,
}: ForumSectorProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "analysis" | "general">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"general" | "analysis">("general");
  const [category, setCategory] = useState<"news" | "tactics" | "transfers" | "general">("general");
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === "analysis") return p.type === "analysis";
    if (activeFilter === "general") return p.type === "general";
    return true;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await onAddPost({ title, content, type, category });
      setTitle("");
      setContent("");
      setType("general");
      setCategory("general");
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    setSubmitting(true);
    try {
      await onComment(postId, newCommentText);
      setNewCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="forum-sector">
      {/* Forum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-white flex flex-wrap items-center gap-2.5">
            Supporters' <span className="text-amber-500 italic font-normal">Rugby Forum</span>
            <span className="text-amber-500 font-mono text-[9px] bg-[#151515] border border-amber-500/20 px-2 py-1 rounded-none uppercase tracking-widest">COMMUNITY</span>
          </h2>
          <p className="text-slate-455 text-xs mt-1 uppercase tracking-wider">
            Read professional rugby match breakdowns or publish your own technical analyses.
          </p>
        </div>

        {/* Action: Create thread */}
        <button
          onClick={() => {
            if (!isLoggedIn) {
              onOpenAuth();
            } else {
              setShowCreateForm(!showCreateForm);
            }
          }}
          className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none transition-all shadow-md self-start sm:self-auto cursor-pointer text-xs uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          <span>Draft New Thread</span>
        </button>
      </div>

      {/* Write a Thread Form */}
      {showCreateForm && isLoggedIn && (
        <form
          onSubmit={handleCreatePost}
          className="p-6 bg-[#0E0E0E] border border-slate-800 rounded-none space-y-4 shadow-xl animate-slide-up"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif uppercase tracking-wider">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Draft Personal Rugby Analysis</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-slate-400 hover:text-white text-xs uppercase tracking-wider font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                Thread Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Breakdown Strategy against the modern Springbok lineout defense"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
                Content Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-200 outline-none text-xs uppercase tracking-wider font-bold"
              >
                <option value="general">General Supporters</option>
                <option value="tactics">Tactical Lineup</option>
                <option value="news">Breaking News</option>
                <option value="transfers">Club Transfers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1.5">
              Form / Analysis Type
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wider cursor-pointer select-none">
                <input
                  type="radio"
                  name="post_type"
                  checked={type === "general"}
                  onChange={() => setType("general")}
                  className="accent-amber-500 w-4 h-4"
                />
                <span>General Discussion</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wider cursor-pointer select-none">
                <input
                  type="radio"
                  name="post_type"
                  checked={type === "analysis"}
                  onChange={() => setType("analysis")}
                  className="accent-amber-500 w-4 h-4"
                />
                <span className="text-amber-505 font-bold flex items-center gap-1">
                  Tactical & Personal Analysis (Gold-Tier Badge)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-450 mb-1">
              Body Content
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your opinions, positional analysis, defensive pattern breakdown, or rugby predictions..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none transition-all text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none transition-all text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Thread"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and View Tabs */}
      <div className="flex items-center justify-between p-4 bg-[#0F0F0F] border border-slate-800 rounded-none">
        <div className="flex items-center gap-2 text-slate-450 text-xs uppercase tracking-wider font-bold">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Filters:</span>
        </div>

        <div className="flex gap-2">
          {(["all", "analysis", "general"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-none transition-all border ${
                activeFilter === filter
                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              } cursor-pointer`}
            >
              {filter === "all" ? "All Discussions" : filter === "analysis" ? "Analyses" : "General Chat"}
            </button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-10 text-center bg-[#0F0F0F] border border-slate-800 rounded-none text-slate-500">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm">No threads matching the filter exist. Draft one!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasVoted = currentUser && post.votedUserIds?.includes(currentUser.id);
            const isAnalysis = post.type === "analysis";

            return (
              <div
                key={post.id}
                className={`p-5 md:p-6 bg-[#0F0F0F] border rounded-none transition-all ${
                  isAnalysis ? "border-amber-500/35" : "border-slate-800"
                }`}
              >
                {/* Post Metadata & Category Headers */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-[#151515] text-amber-500 rounded-none border border-slate-850 font-mono">
                      {post.category}
                    </span>
                    {isAnalysis && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-amber-550/10 border border-amber-500/20 text-amber-400 rounded-none flex items-center gap-1 font-sans">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Tactical Analysis</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    By <strong className="text-slate-350">{post.author}</strong> on {formatDate(post.createdAt)}
                  </span>
                </div>

                {/* Title and Content */}
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight font-sans leading-snug hover:text-amber-500 transition-colors cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-slate-350 text-xs mt-3 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Voting & Discussion Control Bar */}
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-900">
                  {/* Upvote Button */}
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onOpenAuth();
                      } else {
                        onVote(post.id);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all border ${
                      hasVoted
                        ? "bg-amber-500 border-amber-500 text-slate-950 font-extrabold"
                        : "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#151515]"
                    } cursor-pointer`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasVoted ? "fill-slate-950" : ""}`} />
                    <span>{post.votes} Upvotes</span>
                  </button>

                  {/* Comments Toggle Button */}
                  <button
                    onClick={() => {
                      setExpandedCommentsId(expandedCommentsId === post.id ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-amber-500 transition-colors font-bold uppercase tracking-widest"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                {/* Expandable Comments Section */}
                {expandedCommentsId === post.id && (
                  <div className="mt-5 pt-4 border-t border-slate-850 space-y-4 animate-slide-up bg-slate-950/20 p-4">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Comments & Responses
                    </h4>

                    {/* Comments List */}
                    {post.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No responses on this thread yet. Be the first to reply!</p>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="p-3.5 bg-slate-950/80 border border-slate-900 rounded-none">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1.5">
                              <span className="text-slate-305 font-bold uppercase tracking-wider">{comment.author}</span>
                              <span>{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write Comment Block */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder={
                          isLoggedIn
                            ? "Add your reply or tactical response..."
                            : "🔒 Sign in to reply to this discussion"
                        }
                        disabled={!isLoggedIn || submitting}
                        className="flex-1 px-3.5 py-2.5 bg-[#0F0F0F] border border-slate-800 focus:border-amber-500 rounded-none text-slate-100 placeholder-slate-600 outline-none text-xs transition-all disabled:opacity-50"
                      />
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            onOpenAuth();
                          } else {
                            handleAddComment(post.id);
                          }
                        }}
                        disabled={submitting || (!newCommentText.trim() && isLoggedIn)}
                        className="p-3 bg-amber-500 hover:bg-white text-slate-950 font-bold rounded-none transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        title="Submit reply"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
