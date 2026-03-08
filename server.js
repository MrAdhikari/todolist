/**
 * SERVER.JS - The Backend
 * 
 * This file runs our Node.js server. Key concepts you'll learn:
 * - How to create a web server with Express
 * - REST API routes (GET, POST, PUT, DELETE)
 * - CORS (allowing frontend to talk to backend)
 * - Reading/writing JSON data
 */
/**
 * SERVER.JS - Enhanced Backend
 *
 * New Features:
 * - Todos now have createdAt (date/time) and category fields
 * - File-based persistence (todos.json) — survives server restarts
 * - Filter by category via GET /api/todos?category=work
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'todos.json');

// ── Persistence helpers ────────────────────────────────────────────────────────

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Could not read todos.json, starting fresh.', e.message);
  }
  // Default seed data
  return {
    nextId: 4,
    todos: [
      { id: 1, text: 'Learn HTML basics',      completed: false, category: 'learning', createdAt: new Date().toISOString() },
      { id: 2, text: 'Master CSS styling',      completed: false, category: 'learning', createdAt: new Date().toISOString() },
      { id: 3, text: 'Understand JavaScript',   completed: true,  category: 'learning', createdAt: new Date().toISOString() }
    ]
  };
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ nextId, todos }, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist todos.json:', e.message);
  }
}

let { nextId, todos } = loadData();

// ── Middleware ─────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── REST API ───────────────────────────────────────────────────────────────────

// GET /api/todos?category=work  — all todos, or filtered by category
app.get('/api/todos', (req, res) => {
  const { category } = req.query;
  const result = category
    ? todos.filter(t => t.category === category)
    : todos;
  res.json(result);
});

// GET /api/categories — unique list of categories in use
app.get('/api/categories', (req, res) => {
  const cats = [...new Set(todos.map(t => t.category).filter(Boolean))];
  res.json(cats);
});

// POST /api/todos — create a new todo
app.post('/api/todos', (req, res) => {
  const { text, category } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    category: (category || 'general').trim().toLowerCase(),
    createdAt: new Date().toISOString()   // ← date/time stamp
  };
  todos.push(newTodo);
  saveData();                              // ← persist across restarts
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id — update text, completed, or category
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  if (req.body.text      !== undefined) todo.text      = req.body.text.trim();
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  if (req.body.category  !== undefined) todo.category  = req.body.category.trim().toLowerCase();

  saveData();
  res.json(todo);
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  saveData();
  res.status(204).send();
});

// ── Start ──────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅ Todo app running at http://localhost:${PORT}`);
  console.log(`   Data persisted to: ${DATA_FILE}\n`);
});