const db = require("./db");

db.query("SELECT email, role FROM users", (err, result) => {
  if (err) {
    console.error("Error:", err);
    process.exit(1);
  }
  
  if (result.length === 0) {
    console.log("No users found in database");
  } else {
    console.log("\n=== Users in Database ===");
    result.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}`);
    });
  }
  
  process.exit(0);
});
