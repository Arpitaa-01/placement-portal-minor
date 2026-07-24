const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");


// ======================================
// ✅ GET ALL APPLICATIONS
// ======================================
router.get(
  "/applications",
  verifyToken,
  checkRole("controller"),
  (req, res) => {

    db.query("SELECT * FROM applications", (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Database Error" });
      }

      res.status(200).json(result);
    });
  }
);


// ======================================
// ✅ UPDATE APPLICATION STATUS
// ======================================
router.put(
  "/update-status",
  verifyToken,
  checkRole("controller"),
  (req, res) => {

    const { application_id, status } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({ message: "Missing Fields" });
    }

    const sql = "UPDATE applications SET status=? WHERE application_id=?";

    db.query(sql, [status, application_id], (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Database Error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Application Not Found" });
      }

      res.status(200).json({ message: "Status Updated Successfully" });
    });
  }
);

module.exports = router;
