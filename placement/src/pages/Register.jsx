import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import api from "../api";
import { FaUser, FaEnvelope, FaLock, FaMoon, FaSun, FaUserCheck } from "react-icons/fa";

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
    // Future use: if (queryRole && ["student", "admin", "controller"].includes(queryRole)) {
    //   setRole(queryRole);
    // }
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
            {/* Future option: <option value="controller">Controller</option> */}
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

      <style>{`
        .page {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', sans-serif;
          background: #f1f5f9;
          transition: background 0.3s ease;
        }

        .dark {
          background: #0f172a;
        }

        .register-card {
          width: 440px;
          max-width: 90%;
          padding: 24px 30px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          color: #1e293b;
          border: 1px solid #e2e8f0;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .dark .register-card {
          background: #1e293b;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          color: #f8fafc;
          border: 1px solid #334155;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .top-bar h2 {
          font-size: 20px;
          margin: 0;
        }

        .subtitle {
          font-size: 13px;
          margin-top: 4px;
          margin-bottom: 14px;
          opacity: 0.8;
        }

        .input-group {
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 9px 12px;
          border-radius: 10px;
          margin-bottom: 11px;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .dark .input-group {
          background: #0f172a;
          border: 1px solid #334155;
        }

        .input-group:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .dark .input-group:focus-within {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
        }

        .input-group input,
        .input-group select {
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          margin: 0;
          padding: 0;
          width: 100%;
          font-size: 14px;
          line-height: 1.4;
          display: block;
        }

        .input-group select {
          cursor: pointer;
        }

        .role-select option {
          background: #ffffff;
          color: #1e293b;
        }

        .dark .role-select option {
          background: #1e293b;
          color: #f8fafc;
        }

        .icon {
          color: #64748b;
          font-size: 15px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .dark .icon {
          color: #94a3b8;
        }

        .error-msg {
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 11px;
          padding: 8px 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 5px;
          text-align: center;
        }

        .success-msg {
          color: #10b981;
          font-size: 13px;
          margin-bottom: 11px;
          padding: 8px 10px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 5px;
          text-align: center;
        }

        .register-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: #4f46e5;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .register-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-link {
          margin-top: 12px;
          margin-bottom: 0;
          text-align: center;
          font-size: 13px;
          opacity: 0.9;
        }

        .login-link a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }

        .dark .login-link a {
          color: #818cf8;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        .toggle {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 18px;
        }

        @media (max-width: 480px) {
          .register-card {
            width: 90%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;
