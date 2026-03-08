/**
 * APP.JS – Improved Todo Frontend
 * Improvements:
 * - Proper empty state handling
 * - Safer DOM rendering
 * - Optimistic UI updates
 * - Better filter refresh
 * - Keyboard UX improvements
 */

const todoForm     = document.getElementById('todo-form');
const todoInput    = document.getElementById('todo-input');
const catInput     = document.getElementById('cat-input');
const todoList     = document.getElementById('todo-list');
const filterList   = document.getElementById('filter-list');
const statsText    = document.getElementById('stats-text');
const progressFill = document.getElementById('progress-fill');

let activeFilter = localStorage.getItem('todoActiveFilter') || 'all';

/* ───────── Boot ───────── */

document.addEventListener('DOMContentLoaded', async () => {
  await loadTodos(activeFilter);
  await loadCategories();
  todoInput.focus();
});


/* ───────── Add Todo ───────── */

todoForm.addEventListener('submit', async (e) => {

  e.preventDefault();

  const text = todoInput.value.trim();
  const category = catInput.value.trim() || 'general';

  if (!text) return;

  try {

    const res = await fetch('/api/todos', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ text, category })
    });

    const newTodo = await res.json();

    addTodoToDOM(newTodo);

    todoInput.value = '';
    catInput.value = '';

    todoInput.focus();

    await refreshFilters();

  } catch(err) {
    console.error('Add failed', err);
  }

});


/* ───────── Load Todos ───────── */

async function loadTodos(category = 'all') {

  try {

    const url = category === 'all'
      ? '/api/todos'
      : `/api/todos?category=${encodeURIComponent(category)}`;

    const res = await fetch(url);
    const todos = await res.json();

    todoList.innerHTML = '';

    if (todos.length === 0) {
      renderEmptyState();
      recalcStatsFromDOM();
      return;
    }

    todos.forEach(addTodoToDOM);
    recalcStatsFromDOM();

  } catch(err) {
    console.error('Load failed', err);
  }

}


/* ───────── Categories ───────── */

async function loadCategories(){

  try {

    const res = await fetch('/api/categories');
    const cats = await res.json();

    renderFilters(cats);

  } catch(err) {
    console.error('Category load failed', err);
  }

}

async function refreshFilters(){
  await loadCategories();
}


/* ───────── Filter UI ───────── */

function renderFilters(cats){

  filterList.innerHTML = '';

  const allBtn = makeFilterBtn('All','all');
  filterList.appendChild(allBtn);

  cats.forEach(cat=>{
    filterList.appendChild(
      makeFilterBtn(capitalize(cat),cat)
    );
  });

}

function makeFilterBtn(label,value){

  const btn = document.createElement('button');

  btn.className = 'filter-btn';
  btn.textContent = label;

  if(activeFilter === value){
    btn.classList.add('active');
  }

  btn.onclick = async ()=>{

    activeFilter = value;
    localStorage.setItem('todoActiveFilter', activeFilter);

    document.querySelectorAll('.filter-btn')
      .forEach(b=>b.classList.remove('active'));

    btn.classList.add('active');

    await loadTodos(value);

  };

  return btn;

}


/* ───────── Render Todo ───────── */

function addTodoToDOM(todo){

  const li = document.createElement('li');
  li.className = 'todo-item';
  if(todo.completed) li.classList.add('completed');

  li.dataset.id = todo.id;

  const main = document.createElement('div');
  main.className = 'todo-main';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;

  main.append(checkbox,text);

  const meta = document.createElement('div');
  meta.className = 'todo-meta';

  const category = document.createElement('span');
  category.className = 'todo-category';
  category.textContent = todo.category || 'general';

  const date = document.createElement('span');
  date.className = 'todo-date';
  date.textContent = formatDate(todo.createdAt);

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.textContent = '✕';

  meta.append(category,date,del);

  li.append(main,meta);

  /* Toggle completed */

  checkbox.addEventListener('change', async ()=>{

    const newState = !todo.completed;

    li.classList.toggle('completed', newState);

    try {

      await fetch(`/api/todos/${todo.id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({completed:newState})
      });

      todo.completed = newState;
      recalcStatsFromDOM();

    } catch(err) {

      console.error('Update failed',err);

      checkbox.checked = todo.completed;
      li.classList.toggle('completed',todo.completed);

    }

  });

  /* Delete */

  del.addEventListener('click', async ()=>{

    li.style.opacity = 0.4;

    try {

      await fetch(`/api/todos/${todo.id}`,{
        method:'DELETE'
      });

      li.remove();

      if(!todoList.children.length){
        renderEmptyState();
      }

      await refreshFilters();

      recalcStatsFromDOM();

    } catch(err){

      console.error('Delete failed',err);
      li.style.opacity = 1;

    }

  });

  // Inline edit on double-click
  text.addEventListener('dblclick', () => {
    startInlineEdit(todo, li, text);
  });

  todoList.appendChild(li);

  recalcStatsFromDOM();

}


/* ───────── Empty State ───────── */

function renderEmptyState(){

  const empty = document.createElement('li');

  empty.className = 'empty-state';
  empty.textContent = 'No tasks yet — add one above.';

  todoList.appendChild(empty);

}


/* ───────── Helpers ───────── */

function recalcStatsFromDOM(){

  if (!statsText || !progressFill) return;

  const items = todoList.querySelectorAll('.todo-item');
  const total = items.length;
  let completed = 0;

  items.forEach(li => {
    if (li.classList.contains('completed')) completed++;
  });

  const remaining = total - completed;

  if (total === 0) {
    statsText.textContent = 'No tasks in this view';
    progressFill.style.width = '0%';
    progressFill.style.opacity = '0.25';
    return;
  }

  statsText.textContent = `${total} tasks • ${completed} done • ${remaining} left`;

  const pct = Math.round((completed / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressFill.style.opacity = '1';
}

function startInlineEdit(todo, li, textSpan){

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;

  textSpan.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;

  const cleanup = () => {
    if (finished) return;
    finished = true;
    input.removeEventListener('blur', onBlur);
    input.removeEventListener('keydown', onKeyDown);
  };

  const commitChange = async (shouldSave) => {
    cleanup();

    const newText = input.value.trim();

    input.replaceWith(textSpan);

    if (!shouldSave || !newText || newText === todo.text) {
      textSpan.textContent = todo.text;
      return;
    }

    textSpan.textContent = newText;

    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText })
      });
      todo.text = newText;
    } catch (err) {
      console.error('Rename failed', err);
      textSpan.textContent = todo.text;
    }
  };

  const onBlur = () => commitChange(true);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitChange(true);
    } else if (e.key === 'Escape') {
      commitChange(false);
    }
  };

  input.addEventListener('blur', onBlur);
  input.addEventListener('keydown', onKeyDown);
}

function formatDate(iso){

  if(!iso) return '';

  const d = new Date(iso);

  return d.toLocaleString(undefined,{
    month:'short',
    day:'numeric',
    hour:'2-digit',
    minute:'2-digit'
  });

}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}