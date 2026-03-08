/**
 * SERVER.JS - The Backend
 * 
 * This file runs our Node.js server. Key concepts you'll learn:
 * - How to create a web server with Express
 * - REST API routes (GET, POST, PUT, DELETE)
 * - CORS (allowing frontend to talk to backend)
 * - Reading/writing JSON data
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory "database" - we store todos here
// In a real app, you'd use MongoDB, PostgreSQL, etc.
let todos = [
  { id: 1, text: 'Learn HTML basics', completed: false },
  { id: 2, text: 'Master CSS styling', completed: false },
  { id: 3, text: 'Understand JavaScript', completed: true }
];
let nextId = 4;

// Middleware: Functions that run before your route handlers
// express.json() parses incoming JSON from requests (like POST body)
app.use(express.json());

// Serve static files (our HTML, CSS, JS) from the 'public' folder
// This is how the browser gets your frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS - lets our frontend (often on different port) call this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ============== REST API ROUTES ==============
// REST = Representational State Transfer
// We use HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)

// GET /api/todos - Fetch all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo (toggle completed or edit text)
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  if (req.body.text !== undefined) todo.text = req.body.text;
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  res.json(todo);
});

// DELETE /api/todos/:id - Remove a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.status(204).send();
});

// Start the server - it "listens" for incoming requests
app.listen(PORT, () => {
  console.log(`\n✅ Todo app running at http://localhost:${PORT}`);
  console.log(`   Open this URL in your browser!\n`);
});
