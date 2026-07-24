const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  // Check if fields are empty
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password required" });
  }

  const requestedRole = typeof role === "string" ? role.toLowerCase() : "";
  const query = requestedRole
    ? "SELECT * FROM users WHERE email = ? AND role = ?"
    : "SELECT * FROM users WHERE email = ?";
  const params = requestedRole ? [email, requestedRole] : [email];

  db.query(query, params, async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error" });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: requestedRole
          ? `Invalid credentials for the ${requestedRole} role`
          : "Invalid Credentials"
      });
    }

    const user = result[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role
    });
  });
});

router.post("/register", (req, res) => {
  const { email, password, name, role } = req.body;

  // Validation
  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Check if user already exists
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database Error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        db.query(
          "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
          [email, hashedPassword, name, role],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Registration failed" });
            }

            res.status(201).json({
              message: "User registered successfully",
              userId: result.insertId
            });
          }
        );
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error hashing password" });
      }
    }
  );
});

module.exports = router;
