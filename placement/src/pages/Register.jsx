import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import api from "../api";
import { FaUser, FaEnvelope, FaLock, FaMoon, FaSun, FaUserCheck } from "react-icons/fa";
import "../styles/Register.css";

function Register() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryRole = (searchParams.get("role") || location.state?.requestedRole || "").toLowerCase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(queryRole || "student");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (queryRole && ["student", "admin"].includes(queryRole)) {
      setRole(queryRole);
    }
  }, [queryRole]);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", { name, email, password, role });

      // Also add to students table if role is student
      if (role === "student") {
        try {
          await api.post("/students", {
            name,
            email,
            year: "", // Can be updated later
            cgpa: 0, // Can be updated later
            resume: "",
            registrationStatus: "pending",
            applicationStatus: "Applied"
          });
        } catch (studentError) {
          console.error("Error adding to students table:", studentError);
          // Don't fail registration if this fails
        }
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className={darkMode ? "page dark" : "page"}>
      <div className="register-card">
        <div className="top-bar">
          <h2>🎓 Create Account</h2>
          <button onClick={() => setDarkMode(!darkMode)} className="toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <p className="subtitle">Join our placement portal 🚀</p>

        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <FaUserCheck className="icon" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="role-select"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <button className="register-btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <Link to={queryRole ? `/login?role=${queryRole}` : "/login"}>Login here</Link>
        </p>
      </div>


    </div>
  );
}

export default Register;
