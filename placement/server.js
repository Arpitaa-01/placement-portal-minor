const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./placement.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

// Create tables
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    location TEXT NOT NULL,
    industry TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    salary TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT,
    description TEXT,
    deadline TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    year TEXT NOT NULL,
    cgpa TEXT NOT NULL,
    resume TEXT,
    registrationStatus TEXT DEFAULT 'pending',
    applicationStatus TEXT DEFAULT 'Applied'
  )`);
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, user) => {
      if (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = `token_${user.id}_${Date.now()}`;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Register error:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userRole = role || 'student';
    db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, password, userRole],
      function(err) {
        if (err) {
          console.error('Error creating user:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        if (userRole === 'student') {
          db.run(
            `INSERT OR IGNORE INTO students (name, email, year, cgpa, resume, registrationStatus, applicationStatus)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, '', 0, '', 'pending', 'Applied'],
            function(err) {
              if (err) {
                console.error('Error adding student record:', err.message);
              }
            }
          );
        }

        res.json({ message: 'Registration successful' });
      }
    );
  });
});
app.get('/companies', (req, res) => {
  db.all('SELECT * FROM companies', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/companies', (req, res) => {
  const { name, email, phone, website, location, industry } = req.body;
  db.run(`INSERT INTO companies (name, email, phone, website, location, industry)
          VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, website, location, industry],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    });
});

app.delete('/companies/:id', (req, res) => {
  db.run('DELETE FROM companies WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Company deleted', changes: this.changes });
  });
});

// Jobs routes
app.get('/jobs', (req, res) => {
  db.all('SELECT * FROM jobs', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/jobs', (req, res) => {
  const { title, company, salary, location, experience, description, deadline } = req.body;
  db.run(`INSERT INTO jobs (title, company, salary, location, experience, description, deadline)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, company, salary, location, experience, description, deadline],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    });
});

app.delete('/jobs/:id', (req, res) => {
  db.run('DELETE FROM jobs WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Job deleted', changes: this.changes });
  });
});

// Students routes
app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/students', (req, res) => {
  const { name, year, cgpa, resume, registrationStatus, applicationStatus } = req.body;
  db.run(`INSERT INTO students (name, year, cgpa, resume, registrationStatus, applicationStatus)
          VALUES (?, ?, ?, ?, ?, ?)`,
    [name, year, cgpa, resume, registrationStatus || 'pending', applicationStatus || 'Applied'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    });
});

app.put('/students/:id', (req, res) => {
  const { name, year, cgpa, resume, registrationStatus, applicationStatus } = req.body;
  db.run(`UPDATE students SET name = ?, year = ?, cgpa = ?, resume = ?,
          registrationStatus = ?, applicationStatus = ? WHERE id = ?`,
    [name, year, cgpa, resume, registrationStatus, applicationStatus, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: req.params.id, ...req.body });
    });
});

app.delete('/students/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Student deleted', changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});