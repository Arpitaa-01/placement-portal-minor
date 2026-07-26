const db = require("./db");

function initializeDatabase() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      website VARCHAR(255),
      location VARCHAR(255) NOT NULL,
      industry VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      salary VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      experience VARCHAR(100),
      description TEXT,
      deadline VARCHAR(100),
      eligible_batch VARCHAR(255) NOT NULL DEFAULT '',
      cgpa VARCHAR(50) NOT NULL DEFAULT '',
      skills VARCHAR(255) DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      year VARCHAR(50) NOT NULL,
      cgpa VARCHAR(50) NOT NULL,
      resume TEXT,
      registrationStatus VARCHAR(50) DEFAULT 'pending',
      applicationStatus VARCHAR(50) DEFAULT 'Applied',
      enrollment VARCHAR(50) DEFAULT '',
      course VARCHAR(100) DEFAULT '',
      batchYear VARCHAR(20) DEFAULT '',
      phone VARCHAR(20) DEFAULT '',
      skills VARCHAR(255) DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      application_id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending'
    )`,
    `CREATE TABLE IF NOT EXISTS job_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      job_title VARCHAR(255),
      company VARCHAR(255),
      student_id INT,
      student_name VARCHAR(255),
      student_email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  statements.forEach((sql) => {
    db.query(sql, (err) => {
      if (err) {
        console.error("MySQL init error:", err.message);
      }
    });
  });

  // Dynamic column migration for existing database installations
  const addColumnIfNotExists = (table, column, definition) => {
    db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
      (err, rows) => {
        if (err) {
          console.error(`Error checking column ${column} in ${table}:`, err.message);
          return;
        }
        if (rows.length === 0) {
          db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
            if (alterErr) {
              console.error(`Error adding column ${column} to ${table}:`, alterErr.message);
            } else {
              console.log(`Column ${column} added successfully to table ${table}.`);
            }
          });
        }
      }
    );
  };

  addColumnIfNotExists("jobs", "eligible_batch", "VARCHAR(255) NOT NULL DEFAULT ''");
  addColumnIfNotExists("jobs", "cgpa", "VARCHAR(50) NOT NULL DEFAULT ''");
  addColumnIfNotExists("jobs", "skills", "VARCHAR(255) DEFAULT ''");
}

module.exports = { initializeDatabase };
