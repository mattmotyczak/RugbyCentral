import { Router, Request, Response } from "express";
import { getDB, saveDB, Post, Comment } from "../utils/db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/forum/news
 * Fetch rugby news, match results, and upcoming fixtures
 */
router.get("/news", (req: Request, res: Response) => {
  const db = getDB();
  res.json({
    news: db.news,
  });
});

/**
 * GET /api/forum/posts
 * Fetch forum posts (general discussions and personal analyses)
 */
router.get("/posts", (req: Request, res: Response) => {
  const db = getDB();
  // Sort posts by newest or most votes
  const sortedPosts = [...db.posts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  res.json({
    posts: sortedPosts,
  });
});

/**
 * POST /api/forum/posts
 * Create a new forum post or tactical analysis (requires authentication)
 */
router.post("/posts", requireAuth, (req: Request, res: Response) => {
  const { title, content, type, category } = req.body;
  const user = (req as any).user;

  if (!title || !content || !type || !category) {
    res.status(400).json({ error: "Title, content, type, and category are required." });
    return;
  }

  if (type !== "general" && type !== "analysis") {
    res.status(400).json({ error: "Type must be 'general' or 'analysis'." });
    return;
  }

  const db = getDB();
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    author: user.username,
    authorId: user.id,
    title: String(title).trim(),
    content: String(content).trim(),
    type,
    category,
    votes: 0,
    votedUserIds: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  db.posts.push(newPost);
  saveDB(db);

  res.status(201).json({
    message: "Post created successfully!",
    post: newPost,
  });
});

/**
 * POST /api/forum/posts/:id/vote
 * Upvote / toggle vote on a post (requires authentication)
 */
router.post("/posts/:id/vote", requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const db = getDB();
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ error: "Post not found." });
    return;
  }

  if (!post.votedUserIds) {
    post.votedUserIds = [];
  }

  const voteIndex = post.votedUserIds.indexOf(user.id);
  if (voteIndex === -1) {
    // Add vote
    post.votedUserIds.push(user.id);
    post.votes += 1;
  } else {
    // Revoke vote (toggle behavior)
    post.votedUserIds.splice(voteIndex, 1);
    post.votes -= 1;
  }

  saveDB(db);

  res.json({
    message: "Vote updated successfully!",
    votes: post.votes,
    voted: voteIndex === -1,
  });
});

/**
 * POST /api/forum/posts/:id/comments
 * Add a comment to a forum post (requires authentication)
 */
router.post("/posts/:id/comments", requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = (req as any).user;

  if (!content || String(content).trim().length === 0) {
    res.status(400).json({ error: "Comment content cannot be empty." });
    return;
  }

  const db = getDB();
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ error: "Post not found." });
    return;
  }

  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    author: user.username,
    content: String(content).trim(),
    createdAt: new Date().toISOString(),
  };

  post.comments.push(newComment);
  saveDB(db);

  res.status(201).json({
    message: "Comment added successfully!",
    comment: newComment,
  });
});

export default router;
