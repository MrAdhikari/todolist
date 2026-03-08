/**
 * APP.JS - Enhanced Frontend
 *
 * New Features:
 * - Display createdAt date/time on each todo
 * - Category badge on each todo
 * - Category input when adding a todo
 * - Sidebar filter: click a category to show only those todos
 */

const todoForm   = document.getElementById('todo-form');
const todoInput  = document.getElementById('todo-input');
const catInput   = document.getElementById('cat-input');
const todoList   = document.getElementById('todo-list');
const filterList = document.getElementById('filter-list');

let activeFilter = 'all';   // currently selected category filter

// ── Boot ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  loadCategories();
});

// ── Form submit ────────────────────────────────────────────────────────────────

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text     = todoInput.value.trim();
  const category = catInput.value.trim() || 'general';
  if (!text) return;

  try {
    const res  = await fetch('/api/todos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, category })
    });
    const newTodo = await res.json();
    addTodoToDOM(newTodo);
    todoInput.value = '';
    catInput.value  = '';
    await refreshFilters();                 // update sidebar in case new category
  } catch (err) {
    console.error('Failed to add todo:', err);
  }
});

// ── Load todos (with optional category filter) ─────────────────────────────────

async function loadTodos(category = 'all') {
  try {
    const url = category === 'all'
      ? '/api/todos'
      : `/api/todos?category=${encodeURIComponent(category)}`;
    const res   = await fetch(url);
    const todos = await res.json();
    todoList.innerHTML = '';
    todos.forEach(t => addTodoToDOM(t));
  } catch (err) {
    console.error('Failed to load todos:', err);
  }
}

// ── Load category filters ──────────────────────────────────────────────────────

async function loadCategories() {
  try {
    const res  = await fetch('/api/categories');
    const cats = await res.json();
    renderFilters(cats);
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

async function refreshFilters() {
  await loadCategories();
}

function renderFilters(cats) {
  filterList.innerHTML = '';

  const allBtn = makeFilterBtn('All', 'all');
  filterList.appendChild(allBtn);

  cats.forEach(cat => {
    filterList.appendChild(makeFilterBtn(capitalize(cat), cat));
  });
}

function makeFilterBtn(label, value) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (activeFilter === value ? ' active' : '');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    activeFilter = value;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadTodos(value);
  });
  return btn;
}

// ── Render a single todo ───────────────────────────────────────────────────────

function addTodoToDOM(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const formattedDate = formatDate(todo.createdAt);

  li.innerHTML = `
    <div class="todo-main">
      <input type="checkbox" ${todo.completed ? 'checked' : ''}>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
    </div>
    <div class="todo-meta">
      <span class="todo-category">${escapeHtml(todo.category || 'general')}</span>
      <span class="todo-date">${formattedDate}</span>
      <button class="delete-btn" title="Delete">✕</button>
    </div>
  `;

  // Toggle completed
  li.querySelector('input[type="checkbox"]').addEventListener('change', async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ completed: !todo.completed })
      });
      todo.completed = !todo.completed;
      li.classList.toggle('completed', todo.completed);
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  });

  // Delete
  li.querySelector('.delete-btn').addEventListener('click', async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
      li.remove();
      await refreshFilters();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  });

  todoList.appendChild(li);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}