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
  const { title, company, salary, location, experience, description, deadline, eligible_batch, cgpa, skills } = req.body;

  if (!title || !company || !salary || !location || !eligible_batch || !cgpa) {
    return res.status(400).json({ error: "Title, company, salary, location, eligible batch, and cgpa are mandatory fields." });
  }

  db.query(
    "INSERT INTO jobs (title, company, salary, location, experience, description, deadline, eligible_batch, cgpa, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, company, salary, location, experience, description, deadline, eligible_batch, cgpa, skills || ""],
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
  const { title, company, salary, location, experience, description, deadline, eligible_batch, cgpa, skills } = req.body;

  if (!title || !company || !salary || !location || !eligible_batch || !cgpa) {
    return res.status(400).json({ error: "Title, company, salary, location, eligible batch, and cgpa are mandatory fields." });
  }

  db.query(
    "UPDATE jobs SET title = ?, company = ?, salary = ?, location = ?, experience = ?, description = ?, deadline = ?, eligible_batch = ?, cgpa = ?, skills = ? WHERE id = ?",
    [title, company, salary, location, experience, description, deadline, eligible_batch, cgpa, skills || "", req.params.id],
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
  const jobId = req.params.id;
  // First delete associated job applications
  db.query("DELETE FROM job_applications WHERE job_id = ?", [jobId], (err) => {
    if (err) {
      console.error("Error cascade deleting job applications:", err);
      return res.status(500).json({ error: err.message });
    }
    // Then delete the job post itself
    db.query("DELETE FROM jobs WHERE id = ?", [jobId], (jobErr, result) => {
      if (jobErr) {
        console.error("Error deleting job post:", jobErr);
        return res.status(500).json({ error: jobErr.message });
      }
      res.json({ message: "Job post and associated applications deleted successfully", changes: result.affectedRows });
    });
  });
});

// APPLY FOR A JOB ENDPOINT
router.post("/:id/apply", (req, res) => {
  const jobId = req.params.id;
  const { student_id, student_name, student_email, job_title, company } = req.body;

  db.query("SELECT * FROM jobs WHERE id = ?", [jobId], (err, jobs) => {
    const job = jobs && jobs.length > 0 ? jobs[0] : {};
    const title = job_title || job.title || "Job Post";
    const compName = company || job.company || "";

    // Ensure table exists on the fly if needed
    const createTableSql = `CREATE TABLE IF NOT EXISTS job_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      job_title VARCHAR(255),
      company VARCHAR(255),
      student_id INT,
      student_name VARCHAR(255),
      student_email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(createTableSql, () => {
      // Check if already applied
      const checkSql = "SELECT * FROM job_applications WHERE job_id = ? AND (student_id = ? OR (student_email = ? AND student_email != ''))";
      db.query(checkSql, [jobId, student_id || 0, student_email || ""], (checkErr, existing) => {
        if (existing && existing.length > 0) {
          return res.status(400).json({ message: "You have already applied for this job." });
        }

        const insertSql = `INSERT INTO job_applications (job_id, job_title, company, student_id, student_name, student_email, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [jobId, title, compName, student_id || null, student_name || "Student", student_email || "", "Applied"];

        db.query(insertSql, params, (insertErr, result) => {
          if (insertErr) {
            console.error("Job application insert error:", insertErr);
            return res.status(500).json({ error: insertErr.message });
          }
          res.json({
            message: `Successfully applied for ${title} at ${compName}!`,
            applicationId: result.insertId,
            jobId: Number(jobId)
          });
        });
      });
    });
  });
});

// GET APPLIED JOBS FOR A USER
router.get("/applications/user/:studentId", (req, res) => {
  const { studentId } = req.params;
  const email = req.query.email || "";

  const createTableSql = `CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    job_title VARCHAR(255),
    company VARCHAR(255),
    student_id INT,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  db.query(createTableSql, () => {
    const sql = "SELECT job_id FROM job_applications WHERE student_id = ? OR (student_email = ? AND student_email != '')";
    db.query(sql, [studentId, email], (err, rows) => {
      if (err) {
        return res.json([]);
      }
      const appliedIds = (rows || []).map(r => r.job_id);
      res.json(appliedIds);
    });
  });
});

// GET FULL APPLICATION DETAILS FOR A STUDENT
router.get("/applications/user-details/:studentId", (req, res) => {
  const { studentId } = req.params;
  const email = req.query.email || "";

  const createTableSql = `CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    job_title VARCHAR(255),
    company VARCHAR(255),
    student_id INT,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;

  db.query(createTableSql, () => {
    const sql = `
      SELECT ja.id as application_id, ja.job_id, ja.job_title, ja.company, ja.status, ja.applied_at,
             j.salary, j.location, j.experience, j.description, j.deadline, j.eligible_batch, j.cgpa, j.skills
      FROM job_applications ja
      LEFT JOIN jobs j ON ja.job_id = j.id
      WHERE ja.student_id = ? OR (ja.student_email = ? AND ja.student_email != '')
      ORDER BY ja.applied_at DESC
    `;
    db.query(sql, [studentId, email], (err, rows) => {
      if (err) {
        console.error("Error fetching application details:", err);
        return res.json([]);
      }
      res.json(rows || []);
    });
  });
});

// Revoke a job application by its application ID
router.delete("/applications/:applicationId", (req, res) => {
  const { applicationId } = req.params;
  // Ensure the application exists before deletion
  db.query("SELECT * FROM job_applications WHERE id = ?", [applicationId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    // Delete the application
    db.query("DELETE FROM job_applications WHERE id = ?", [applicationId], (delErr, result) => {
      if (delErr) {
        console.error(delErr);
        return res.status(500).json({ error: delErr.message });
      }
      res.json({ message: "Application revoked", changes: result.affectedRows });
    });
  });
});

// GET ALL APPLICATIONS FOR A SPECIFIC JOB (WITH STUDENT DETAILS)
router.get("/applications/job/:jobId", (req, res) => {
  const { jobId } = req.params;
  const sql = `
    SELECT ja.id AS application_id, ja.status AS application_status, ja.applied_at,
           s.id AS student_id, COALESCE(s.name, ja.student_name) AS student_name, COALESCE(s.email, ja.student_email) AS student_email,
           s.year AS student_year, s.cgpa AS student_cgpa, s.resume AS student_resume,
           s.enrollment, s.course, s.batchYear, s.phone, s.skills AS student_skills
    FROM job_applications ja
    LEFT JOIN students s ON (ja.student_id = s.id OR (ja.student_email = s.email AND ja.student_email != ''))
    WHERE ja.job_id = ?
    ORDER BY ja.applied_at DESC
  `;
  
  db.query(sql, [jobId], (err, rows) => {
    if (err) {
      console.error("Error fetching job applications:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

module.exports = router;
