const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./database");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const controllerRoutes = require("./routes/controller");
const companiesRoutes = require("./routes/companies");
const jobsRoutes = require("./routes/jobs");
const studentsRoutes = require("./routes/students");

const app = express();

app.use(cors());
app.use(express.json());

initializeDatabase();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/controller", controllerRoutes);

// Resource routes (mounted on both root and /api/ prefixes for consistency)
app.use("/companies", companiesRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/jobs", jobsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/students", studentsRoutes);
app.use("/api/students", studentsRoutes);

// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.send("API Running Successfully 🚀");
});

// START SERVER
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
