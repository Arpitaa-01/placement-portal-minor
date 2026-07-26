const express = require("express");
const db = require("../db");

const router = express.Router();

// Auto-migrate: add missing columns to students table safely
const migrateStudentsTable = () => {
  const addColumnIfNotExists = (column, definition) => {
    db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = ?`,
      [column],
      (err, rows) => {
        if (err) {
          console.error(`Error checking column ${column} in students table:`, err.message);
          return;
        }
        if (rows.length === 0) {
          db.query(`ALTER TABLE students ADD COLUMN ${column} ${definition}`, (alterErr) => {
            if (alterErr) {
              console.error(`Error adding column ${column} to students table:`, alterErr.message);
            } else {
              console.log(`Column ${column} added successfully to students table.`);
            }
          });
        }
      }
    );
  };

  addColumnIfNotExists("enrollment", "VARCHAR(50) DEFAULT ''");
  addColumnIfNotExists("course", "VARCHAR(100) DEFAULT ''");
  addColumnIfNotExists("batchYear", "VARCHAR(20) DEFAULT ''");
  addColumnIfNotExists("phone", "VARCHAR(20) DEFAULT ''");
  addColumnIfNotExists("skills", "VARCHAR(255) DEFAULT ''");
};
migrateStudentsTable();

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
  const { name, email, year, cgpa, resume, registrationStatus, applicationStatus, enrollment, course, batchYear, phone, skills } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // Check if a student with this email already exists to prevent duplicate entry errors
  db.query("SELECT id FROM students WHERE LOWER(email) = ?", [email.toLowerCase()], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    if (rows && rows.length > 0) {
      const studentId = rows[0].id;
      db.query(
        "UPDATE students SET name = ?, year = ?, cgpa = ?, resume = ?, registrationStatus = ?, applicationStatus = ?, enrollment = ?, course = ?, batchYear = ?, phone = ?, skills = ? WHERE id = ?",
        [name, year, cgpa, resume, registrationStatus || "pending", applicationStatus || "Applied", enrollment || "", course || "", batchYear || "", phone || "", skills || "", studentId],
        (updateErr) => {
          if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: updateErr.message });
          }
          res.json({ id: studentId, ...req.body });
        }
      );
    } else {
      db.query(
        "INSERT INTO students (name, email, year, cgpa, resume, registrationStatus, applicationStatus, enrollment, course, batchYear, phone, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, year, cgpa, resume, registrationStatus || "pending", applicationStatus || "Applied", enrollment || "", course || "", batchYear || "", phone || "", skills || ""],
        (insertErr, result) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ error: insertErr.message });
          }
          res.json({ id: result.insertId, ...req.body });
        }
      );
    }
  });
});

router.put("/:id", (req, res) => {
  const { name, year, cgpa, resume, registrationStatus, applicationStatus, enrollment, course, batchYear, phone, skills } = req.body;

  db.query(
    "UPDATE students SET name = ?, year = ?, cgpa = ?, resume = ?, registrationStatus = ?, applicationStatus = ?, enrollment = ?, course = ?, batchYear = ?, phone = ?, skills = ? WHERE id = ?",
    [name, year, cgpa, resume, registrationStatus, applicationStatus, enrollment || "", course || "", batchYear || "", phone || "", skills || "", req.params.id],
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
