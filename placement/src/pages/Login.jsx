import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun } from "react-icons/fa";
import api, { setAuthToken } from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || null;
  const requestedRole = location.state?.requestedRole || null;

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
      
      {/* Floating Shapes */}
      <div className="shape shape1"></div>
      <div className="shape shape2"></div>
      <div className="shape shape3"></div>

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
          <Link to="/register">Sign up here</Link>
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

        .login-card {
          width: 350px;
          padding: 40px;
          border-radius: 20px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          color: white;
          z-index: 10;
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

        .input-group input {
          border: none;
          outline: none;
          background: transparent;
          color: white;
          margin-left: 10px;
          width: 100%;
        }

        .icon {
          color: white;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: white;
          color: #6a11cb;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .login-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-msg {
          color: #ff6b6b;
          font-size: 14px;
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(255, 107, 107, 0.2);
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
          color: #ffeb3b;
          text-decoration: none;
          font-weight: 600;
          transition: 0.3s;
        }

        .signup-link a:hover {
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
