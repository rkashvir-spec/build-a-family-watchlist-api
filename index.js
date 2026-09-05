import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware/authenticate.js';
import { authorizeModification } from './middleware/authorize.js';
import { 
  findByUsername, 
  getWatchlist, 
  addMovie, 
  updateMovie, 
  deleteMovie 
} from './utils/db.js';

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ==========================================
// Authentication Routes
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = findByUsername(username);

  // FIX: Match against '_password' as defined in your users.json schema
  if (!user || user._password !== password) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );

  return res.status(200).json({ token });
});

// ==========================================
// Watchlist Routes
// ==========================================

app.get('/api/watchlist/:userId', authenticate, (req, res) => {
  const userId = req.params.userId;
  const list = getWatchlist(Number(userId)) || getWatchlist(userId);
  return res.status(200).json(list || []);
});

app.post('/api/watchlist/:userId/movies', authenticate, authorizeModification, (req, res) => {
  const userId = req.params.userId;
  const movieData = req.body;

  const result = addMovie(Number(userId) || userId, movieData);
  return res.status(201).json(result);
});

app.put('/api/watchlist/:userId/movies/:movieId', authenticate, authorizeModification, (req, res) => {
  const userId = req.params.userId;
  const movieId = req.params.movieId;
  const updates = req.body;

  const result = updateMovie(Number(userId) || userId, Number(movieId) || movieId, updates);
  return res.status(200).json(result);
});

app.delete('/api/watchlist/:userId/movies/:movieId', authenticate, authorizeModification, (req, res) => {
  const userId = req.params.userId;
  const movieId = req.params.movieId;

  const result = deleteMovie(Number(userId) || userId, Number(movieId) || movieId);
  return res.status(200).json(result);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
