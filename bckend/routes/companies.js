const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM companies", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { name, email, phone, website, location, industry } = req.body;

  db.query(
    "INSERT INTO companies (name, email, phone, website, location, industry) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, phone, website, location, industry],
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
  const { name, email, phone, website, location, industry } = req.body;

  db.query(
    "UPDATE companies SET name = ?, email = ?, phone = ?, website = ?, location = ?, industry = ? WHERE id = ?",
    [name, email, phone, website, location, industry, req.params.id],
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
  db.query("DELETE FROM companies WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Company deleted", changes: result.affectedRows });
  });
});

module.exports = router;
