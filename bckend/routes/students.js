const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { name, year, cgpa, resume, registrationStatus, applicationStatus } = req.body;

  const emailValue = req.body.email || "";

  db.query(
    "INSERT INTO students (name, email, year, cgpa, resume, registrationStatus, applicationStatus) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, emailValue, year, cgpa, resume, registrationStatus || "pending", applicationStatus || "Applied"],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, year, cgpa, resume, registrationStatus, applicationStatus } = req.body;

  db.query(
    "UPDATE students SET name = ?, year = ?, cgpa = ?, resume = ?, registrationStatus = ?, applicationStatus = ? WHERE id = ?",
    [name, year, cgpa, resume, registrationStatus, applicationStatus, req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: req.params.id, ...req.body });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM students WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Student deleted", changes: result.affectedRows });
  });
});

module.exports = router;
