/**
 * APP.JS - Frontend JavaScript
 * 
 * You'll learn:
 * - DOM manipulation (getting elements, creating, modifying)
 * - Event listeners (form submit, click)
 * - Fetch API (talking to our backend)
 * - Async/await for handling API responses
 */

// Get references to DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Load todos when page loads
document.addEventListener('DOMContentLoaded', loadTodos);

// Handle form submit - add new todo
todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();  // Stop form from refreshing the page
  const text = todoInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const newTodo = await response.json();
    addTodoToDOM(newTodo);
    todoInput.value = '';
  } catch (err) {
    console.error('Failed to add todo:', err);
  }
});

// Fetch all todos from the API
async function loadTodos() {
  try {
    const response = await fetch('/api/todos');
    const todos = await response.json();
    todoList.innerHTML = '';
    todos.forEach(todo => addTodoToDOM(todo));
  } catch (err) {
    console.error('Failed to load todos:', err);
  }
}

// Add a todo item to the page (creates the HTML)
function addTodoToDOM(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  li.innerHTML = `
    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn">Delete</button>
  `;

  // Toggle completed when checkbox is clicked
  li.querySelector('input[type="checkbox"]').addEventListener('change', async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      todo.completed = !todo.completed;
      li.classList.toggle('completed', todo.completed);
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  });

  // Delete when Delete button is clicked
  li.querySelector('.delete-btn').addEventListener('click', async () => {
    try {
      await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
      li.remove();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  });

  todoList.appendChild(li);
}

// Prevent XSS - escape user input before putting in HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
