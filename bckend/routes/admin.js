const express = require("express");
const db = require("../db");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

// ADD JOB (Only Admin)
router.post(
  "/add-job",
  verifyToken,
  checkRole("admin"),
  (req, res) => {
    const { company_id, job_title, job_description, eligibility, last_date } = req.body;

    if (!company_id || !job_title || !job_description || !eligibility || !last_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    db.query(
      "INSERT INTO jobs (company_id, job_title, job_description, eligibility, last_date) VALUES (?,?,?,?,?)",
      [company_id, job_title, job_description, eligibility, last_date],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json({ message: "Job Added Successfully" });
      }
    );
  }
);

module.exports = router;
