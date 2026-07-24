const db = require("./db");
const bcrypt = require("bcrypt");

const users = [];

async function resetPasswords() {
  if (users.length === 0) {
    console.log("No users configured for password reset.");
    process.exit(0);
    return;
  }

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.newPassword, 10);
      
      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, user.email],
        (err, result) => {
          if (err) {
            console.error(`Error updating ${user.email}:`, err);
          } else {
            console.log(`✅ ${user.email} password updated to: ${user.newPassword}`);
          }
        }
      );
    } catch (err) {
      console.error(`Error hashing password for ${user.email}:`, err);
    }
  }
  
  setTimeout(() => {
    console.log("\n=== New Credentials ===");
    users.forEach(u => {
      console.log(`${u.role.toUpperCase()}: ${u.email} / ${u.newPassword}`);
    });
    process.exit(0);
  }, 1000);
}

resetPasswords();
