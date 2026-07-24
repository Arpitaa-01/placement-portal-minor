import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ControllerDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchApplications();
    // Set up auto-refresh every 3 seconds to get new students automatically
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = () => {
    // Mock data for applications
    const mockApplications = [
      { id: 1, name: "Bharat Bhusan", email: "bhusanb2000@gmail.com", status: "approved" },
      { id: 2, name: "Aman Kumar", email: "aman@gmail.com", status: "pending" },
      { id: 3, name: "Neha Sharma", email: "neha@gmail.com", status: "rejected" },
      { id: 4, name: "Kajal Mishra", email: "kajal@gmail.com", status: "pending" },
      { id: 5, name: "nishant", email: "nishant@gmail.com", status: "approved" },
      { id: 6, name: "manish", email: "manish@gmail.com", status: "pending" },
    ];

    setApplications(mockApplications);

    const total = mockApplications.length;
    const approved = mockApplications.filter(a => a.status === "approved").length;
    const rejected = mockApplications.filter(a => a.status === "rejected").length;
    const pending = mockApplications.filter(a => a.status === "pending").length;

    setStats({ total, approved, rejected, pending });
  };

  const updateStatus = (id, status) => {
    const updatedApplications = applications.map((app) =>
      app.id === id ? { ...app, status } : app
    );

    setApplications(updatedApplications);

    const total = updatedApplications.length;
    const approved = updatedApplications.filter(a => a.status === "approved").length;
    const rejected = updatedApplications.filter(a => a.status === "rejected").length;
    const pending = updatedApplications.filter(a => a.status === "pending").length;

    setStats({ total, approved, rejected, pending });

    alert("Status Updated Successfully");
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="d-flex">

      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: "250px", height: "100vh" }}>
        <h4>Controller Panel</h4>
        <hr />
        <p>Dashboard</p>
        <p>Applications</p>
        <hr />
        <div className="d-grid gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/")}>
            🏠 Home
          </button>
          <button className="btn btn-info btn-sm" onClick={() => navigate("/admin")}>
            👨‍💼 Admin
          </button>
          <button className="btn btn-success btn-sm" onClick={() => navigate("/student")}>
            👨‍🎓 Student
          </button>
        </div>
        <button className="btn btn-danger mt-3 w-100" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="container-fluid p-4">

        {/* Navbar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Main Dashboard</h2>
          <span className="text-muted">Welcome Nishant</span>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h5>Total Applications</h5>
              <h3>{stats.total}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3 bg-success text-white">
              <h5>Approved</h5>
              <h3>{stats.approved}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3 bg-danger text-white">
              <h5>Rejected</h5>
              <h3>{stats.rejected}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow text-center p-3 bg-warning text-dark">
              <h5>Pending</h5>
              <h3>{stats.pending}</h3>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card shadow p-3">
          <h4>All Applications</h4>
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td>
                    <span className={`badge 
                      ${app.status === "approved" ? "bg-success" :
                        app.status === "rejected" ? "bg-danger" :
                          "bg-warning text-dark"}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => updateStatus(app.id, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => updateStatus(app.id, "rejected")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ControllerDashboard;
