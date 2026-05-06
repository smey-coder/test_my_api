// const express = require('express'); 
// const cors = require('cors'); 
// const ip = require('ip'); 
// const app = express(); 
// app.use(cors()); 
// app.use(express.json()); 

// // In-memory data store 
// let todos = [ 
// { id: 1, name: "Study Flutter", description: "Learn API" }, 
// { id: 2, name: "Study React", description: "Learn API" },
// {id: 3, name: "Study Html", description: "Learn Html"}
// ]; 

// //Get all todos
// app.get('/todos', (req, res) => { 
// res.json(todos); 
// });

// //Get on todo
// app.get('/todos/:id', (req, res) => {  
// const id = parseInt(req.params.id);  
// const todo = todos.find(t => t.id === id);  
// if (!todo) return res.status(404).json({ error: "Not found" });  
// res.json(todo);  
// }); 

// //Create todo
// app.post('/todos', (req, res) => {  
// const { name, description } = req.body;  
// const newTodo = { id: Date.now(), name, description };  
// todos.push(newTodo); res.status(201).json(newTodo);  
// });

// //Updated todo
// app.put('/todos/:id', (req, res) => {  
// const id = parseInt(req.params.id);  
// const { name, description } = req.body;  
// const todo = todos.find(t => t.id === id);  
// if (!todo) return res.status(404).json({ error: "Not found" });  
// todo.name = name;  
// todo.description = description;  
// res.json(todo);  
// });

// //Delete todo
// app.delete('/todos/:id', (req, res) => {  
// const id = parseInt(req.params.id); 
// const todo = todos.find(t => t.id === id); 
// if (!todo) return res.status(404).json({ error: "Not found" }); 
// todos = todos.filter(t => t.id !== id); 
// res.json(todo);  
// }); 

// // Start the server 
// const PORT = 3000; 
// const HOST = ip.address(); 
// app.listen(PORT, HOST, () => { 
// console.log(`Server running on http://${HOST}:${PORT}`); 
// });

//-----------------------------------------
// Connection with Database MySQL
const express = require('express');
const cors = require('cors');
const ip = require('ip');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// MySQL Connection (Pool)
// ===============================
const db = mysql.createPool({
  host: 'localhost',
  user: 'SmeyKh',
  password: 'hello123(*)', // change if you have password
  database: 'todo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
    connection.release();
  }
});

// ===============================
// ROUTES
// ===============================

// 🔹 GET all todos
app.get('/todos', (req, res) => {
  db.query('SELECT * FROM todos', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// 🔹 GET single todo
app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM todos WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(results[0]);
  });
});

// 🔹 CREATE todo
app.post('/todos', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  db.query(
    'INSERT INTO todos (name, description) VALUES (?, ?)',
    [name, description],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Insert failed' });
      }

      res.status(201).json({
        id: result.insertId,
        name,
        description
      });
    }
  );
});

// 🔹 UPDATE todo
app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;

  db.query(
    'UPDATE todos SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Update failed' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      res.json({ id, name, description });
    }
  );
});

// 🔹 DELETE todo
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Delete failed' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Deleted successfully' });
  });
});

// ===============================
// SERVER START
// ===============================
const PORT = 3000;
const HOST = ip.address();

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});