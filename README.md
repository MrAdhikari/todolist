# 📝 Todo List App - Web Development Learning Project

A simple full-stack todo app built to teach you the fundamentals of web development.

## Quick Start

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

---

## What You'll Learn

### 1. **HTML** (`public/index.html`)
- Structure of a web page
- Semantic tags: `header`, `form`, `ul`, `li`
- Forms and inputs
- Linking CSS and JS files

### 2. **CSS** (`public/style.css`)
- Selectors (element, class, id)
- Flexbox layout
- Colors, spacing, borders
- Hover effects and transitions

### 3. **JavaScript** (`public/app.js`)
- **DOM**: Selecting and manipulating elements
- **Events**: Click, submit, change
- **Fetch API**: `GET`, `POST`, `PUT`, `DELETE` to our backend
- **async/await**: Handling asynchronous code

### 4. **Node.js + Express** (`server.js`)
- Creating an HTTP server
- **REST API** routes
- Middleware (`express.json`, `express.static`, CORS)
- Request/response cycle

### 5. **How It All Works Together**

```
Browser                    Server
   |                         |
   |  GET /api/todos         |
   | ---------------------->|  Returns list of todos
   | <----------------------|
   |                         |
   |  POST /api/todos        |
   |  { "text": "Buy milk" } |
   | ---------------------->|  Creates todo, returns it
   | <----------------------|
```

---

## Project Structure

```
todoapp/
├── server.js          # Backend - Express server & API
├── package.json       # Dependencies (Express)
├── public/
│   ├── index.html    # Page structure
│   ├── style.css     # Styling
│   └── app.js        # Frontend logic & API calls
└── README.md
```

---

## Next Steps to Level Up

1. **Add persistence** – Save todos to a JSON file or database
2. **Add filtering** – Show All / Active / Completed tabs
3. **Edit todos** – Double-click to edit text
4. **Add dates** – Due dates for each todo
5. **Deploy** – Try Render, Railway, or Vercel

Happy coding! 🚀
