import { useState } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun } from "react-icons/fa";
import api, { setAuthToken } from "../api";

function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryRole = (searchParams.get("role") || location.state?.requestedRole || "").toLowerCase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const redirectTo = location.state?.redirectTo || null;
  const requestedRole = queryRole || location.state?.requestedRole || null;

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log("Starting login attempt with:", { email, password });
    try {
      console.log("Making API call to /api/auth/login");
      const res = await api.post("/api/auth/login", { email, password });
      console.log("API response:", res.data);
      const responseData = res.data?.data || res.data;
      const token = responseData?.token || responseData?.accessToken || responseData?.user?.token;
      const userData = responseData?.user || responseData;
      const role = responseData?.role || userData?.role || requestedRole || "student";

      console.log("Extracted token:", token, "role:", role, "userData:", userData);

      if (!token) {
        throw new Error("Login did not return a valid auth token.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setAuthToken(token);

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("Stored user data:", userData);
      }

      console.log("About to navigate to role:", role);
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        if (role === "student") navigate("/student");
        else if (role === "admin") navigate("/admin");
        else if (role === "controller") navigate("/controller");
        else navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Login failed. Please check your backend and credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className={darkMode ? "page dark" : "page"}>

      <div className="login-card">
        <div className="top-bar">
          <h2>🎓 Placement Portal</h2>
          <button onClick={() => setDarkMode(!darkMode)} className="toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <p className="subtitle">Welcome Back 👋</p>

        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="email"
            placeholder="Enter Email"
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
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          Don't have an account?{" "}
          <Link to={queryRole ? `/register?role=${queryRole}` : "/register"}>Sign up here</Link>
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

        .login-card {
          width: 440px;
          max-width: 90%;
          padding: 30px 35px;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          color: #1e293b;
          border: 1px solid #e2e8f0;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .dark .login-card {
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
          font-size: 14px;
          margin-top: 4px;
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .input-group {
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 14px;
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

        .input-group input {
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          margin: 0;
          padding: 0;
          width: 100%;
          font-size: 15px;
          line-height: 1.5;
          display: block;
        }

        .icon {
          color: #64748b;
          font-size: 16px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .dark .icon {
          color: #94a3b8;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: #4f46e5;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .login-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-msg {
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 5px;
          text-align: center;
        }

        .input-group input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .signup-link {
          margin-top: 15px;
          text-align: center;
          font-size: 14px;
          opacity: 0.9;
        }

        .signup-link a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
        }

        .dark .signup-link a {
          color: #818cf8;
        }

        .signup-link a:hover {
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
          .login-card {
            width: 90%;
            padding: 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
