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
      deadline VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      year VARCHAR(50) NOT NULL,
      cgpa VARCHAR(50) NOT NULL,
      resume TEXT,
      registrationStatus VARCHAR(50) DEFAULT 'pending',
      applicationStatus VARCHAR(50) DEFAULT 'Applied'
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      application_id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending'
    )`
  ];

  statements.forEach((sql) => {
    db.query(sql, (err) => {
      if (err) {
        console.error("MySQL init error:", err.message);
      }
    });
  });
}

module.exports = { initializeDatabase };
