import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { FaUser, FaEnvelope, FaLock, FaMoon, FaSun, FaUserCheck } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
      {/* Floating Shapes */}
      <div className="shape shape1"></div>
      <div className="shape shape2"></div>
      <div className="shape shape3"></div>

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
            <option value="controller">Controller</option>
          </select>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <button className="register-btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/">Login here</Link>
        </p>
      </div>

      <style>{`
        .page {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(-45deg, #6a11cb, #2575fc, #ff6a00, #ee0979);
          background-size: 400% 400%;
          animation: gradientMove 10s ease infinite;
        }

        .dark {
          filter: brightness(0.9);
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          animation: float 6s ease-in-out infinite;
        }

        .shape1 { width: 200px; height: 200px; top: 10%; left: 10%; }
        .shape2 { width: 150px; height: 150px; bottom: 15%; right: 10%; }
        .shape3 { width: 100px; height: 100px; top: 70%; left: 40%; }

        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        .register-card {
          width: 400px;
          padding: 40px;
          border-radius: 20px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          color: white;
          z-index: 10;
          max-height: 95vh;
          overflow-y: auto;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .subtitle {
          font-size: 14px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.2);
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .input-group input,
        .input-group select {
          border: none;
          outline: none;
          background: transparent;
          color: white;
          margin-left: 10px;
          width: 100%;
          font-size: 14px;
        }

        .input-group select {
          cursor: pointer;
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .role-select {
          color: white;
        }

        .role-select option {
          background: #333;
          color: white;
        }

        .icon {
          color: white;
          min-width: 20px;
        }

        .error-msg {
          color: #ff6b6b;
          font-size: 13px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(255, 107, 107, 0.2);
          border-radius: 5px;
          text-align: center;
        }

        .success-msg {
          color: #51cf66;
          font-size: 13px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(81, 207, 102, 0.2);
          border-radius: 5px;
          text-align: center;
        }

        .register-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: white;
          color: #6a11cb;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
          font-size: 15px;
        }

        .register-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-link {
          margin-top: 15px;
          text-align: center;
          font-size: 14px;
          opacity: 0.9;
        }

        .login-link a {
          color: #ffeb3b;
          text-decoration: none;
          font-weight: 600;
          transition: 0.3s;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .toggle {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }

        @media (max-width: 480px) {
          .register-card {
            width: 90%;
            padding: 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;
