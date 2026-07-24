const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM jobs", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { title, company, salary, location, experience, description, deadline } = req.body;

  db.query(
    "INSERT INTO jobs (title, company, salary, location, experience, description, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, company, salary, location, experience, description, deadline],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM jobs WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Job deleted", changes: result.affectedRows });
  });
});

module.exports = router;
