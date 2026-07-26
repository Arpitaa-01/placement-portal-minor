import { useState } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { FaUser, FaLock, FaMoon, FaSun } from "react-icons/fa";
import api, { setAuthToken } from "../api";
import "../styles/Login.css";

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
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
        ...(requestedRole ? { role: requestedRole } : {})
      });
      const responseData = res.data?.data || res.data;
      const token = responseData?.token || responseData?.accessToken || responseData?.user?.token;
      const userData = responseData?.user || responseData;
      const backendRole = responseData?.role || userData?.role;
      const role = backendRole || requestedRole || "student";

      if (requestedRole && backendRole && backendRole !== requestedRole) {
        throw new Error(`This account is not authorized for the ${requestedRole} role.`);
      }


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

      if (redirectTo) {
        navigate(redirectTo);
      } else {
        if (role === "student") navigate("/student");
        else if (role === "admin") navigate("/admin");
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


    </div>
  );
}

export default Login;
