const jwt = require("jsonwebtoken");
const router = require("./auth");

// VERIFY TOKEN
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], "secretkey");
    req.user = decoded;   // store user data
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// CHECK ROLE
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access Denied" });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };

module.exports = router;
