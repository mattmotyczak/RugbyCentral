import { Router, Request, Response } from "express";
import { getDB, saveDB, RugbyPlayer, TacticBoard } from "../utils/db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/tactics/players
 * Fetch all available rugby players. Returns standard players, plus user's custom players if logged in.
 */
router.get("/players", optionalAuth, (req: Request, res: Response) => {
  const db = getDB();
  const user = (req as any).user;

  // Start with global standard players
  let result = db.players.filter((p) => !p.isCustom);

  // If user is logged in, also include their custom players
  if (user) {
    const customPlayers = db.players.filter(
      (p) => p.isCustom && p.userId === user.id
    );
    result = [...result, ...customPlayers];
  }

  res.json({
    players: result,
  });
});

/**
 * POST /api/tactics/players
 * Add a custom player to the database (requires authentication)
 */
router.post("/players", requireAuth, (req: Request, res: Response) => {
  const { name, position, rating, club, country } = req.body;
  const user = (req as any).user;

  if (!name || !position || !rating) {
    res.status(400).json({ error: "Name, position, and rating (1-99) are required." });
    return;
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 99) {
    res.status(400).json({ error: "Rating must be a number between 1 and 99." });
    return;
  }

  const db = getDB();
  const newPlayer: RugbyPlayer = {
    id: `player-custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: String(name).trim(),
    position: String(position).trim(),
    rating: numRating,
    club: String(club || "Custom Club").trim(),
    country: String(country || "Custom Country").trim(),
    isCustom: true,
    userId: user.id,
  };

  db.players.push(newPlayer);
  saveDB(db);

  res.status(201).json({
    message: "Custom player added successfully!",
    player: newPlayer,
  });
});

/**
 * GET /api/tactics/boards
 * Fetch saved tactical boards for the logged-in user
 */
router.get("/boards", requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDB();

  const userBoards = db.tactics.filter((board) => board.userId === user.id);
  res.json({
    boards: userBoards,
  });
});

/**
 * POST /api/tactics/boards
 * Save or update a tactical board (requires authentication)
 */
router.post("/boards", requireAuth, (req: Request, res: Response) => {
  const { id, name, formation, playersOnField, notes } = req.body;
  const user = (req as any).user;

  if (!name || !formation || !playersOnField || !Array.isArray(playersOnField)) {
    res.status(400).json({ error: "Name, formation, and players distribution are required." });
    return;
  }

  const db = getDB();
  
  if (id) {
    // Update existing board
    const boardIndex = db.tactics.findIndex((b) => b.id === id);
    if (boardIndex !== -1) {
      const existingBoard = db.tactics[boardIndex];
      if (existingBoard.userId !== user.id) {
         res.status(403).json({ error: "You do not have permission to edit this tactical setup." });
         return;
      }

      db.tactics[boardIndex] = {
        ...existingBoard,
        name: String(name).trim(),
        formation,
        playersOnField,
        notes: notes ? String(notes).trim() : existingBoard.notes,
      };
      saveDB(db);
      res.json({
        message: "Tactical board updated successfully!",
        board: db.tactics[boardIndex],
      });
      return;
    }
  }

  // Create new board
  const newBoard: TacticBoard = {
    id: `board-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: String(name).trim(),
    formation,
    playersOnField,
    userId: user.id,
    username: user.username,
    notes: notes ? String(notes).trim() : "",
    createdAt: new Date().toISOString(),
  };

  db.tactics.push(newBoard);
  saveDB(db);

  res.status(201).json({
    message: "Tactical board saved successfully!",
    board: newBoard,
  });
});

/**
 * POST /api/tactics/share
 * Mock-share tactical board screenshot or layout details to social media (requires authentication)
 */
router.post("/share", requireAuth, (req: Request, res: Response) => {
  const { boardId, platform } = req.body;
  const user = (req as any).user;

  if (!boardId || !platform) {
    res.status(400).json({ error: "Board ID and platform (e.g., 'twitter', 'facebook', 'whatsapp') are required." });
    return;
  }

  const db = getDB();
  const board = db.tactics.find((b) => b.id === boardId);

  if (!board) {
    res.status(404).json({ error: "Tactical board not found." });
    return;
  }

  if (board.userId !== user.id) {
    res.status(403).json({ error: "You can only share your own tactical creations." });
    return;
  }

  // Generate a mock shared link and tracking ID
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const shareUrl = `/share/board/${board.id}?ref=${shareId}`;

  res.json({
    message: `Tactical board "${board.name}" successfully exported to ${platform}!`,
    shareUrl,
    platform,
    user: user.username,
    timestamp: new Date().toISOString(),
  });
});

export default router;
