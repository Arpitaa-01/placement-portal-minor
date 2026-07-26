import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import "../styles/HomeDashboard.css";
import logo from '../picture/logo.png';

export default function HomeDashboard() {
  const navigate = useNavigate();

  const handleDashboardAccess = (dashboard, role) => {
    navigate(`/login?role=${role}`, { state: { redirectTo: dashboard, requestedRole: role } });
  };


  const [jobOpenings, setJobOpenings] = useState([]);
  const [adminCompanies, setAdminCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [submittingJobId, setSubmittingJobId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, companiesRes] = await Promise.allSettled([
          api.get('/jobs'),
          api.get('/companies')
        ]);

        if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
          setJobOpenings(jobsRes.value.data.map(job => ({
            id: job.id,
            company: job.company,
            role: job.title,
            package: job.salary,
            deadline: job.deadline
          })));
        } else {
          setJobOpenings([]);
        }

        if (companiesRes.status === "fulfilled" && Array.isArray(companiesRes.value.data)) {
          setAdminCompanies(companiesRes.value.data);
        } else {
          setAdminCompanies([]);
        }

        // Check if user is logged in and fetch applied job IDs
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const userId = user.id || user.user_id || 1;
            const email = user.email || "";
            const appliedRes = await api.get(`/jobs/applications/user/${userId}?email=${encodeURIComponent(email)}`);
            if (Array.isArray(appliedRes.data)) {
              setAppliedJobIds(appliedRes.data.map(id => Number(id)));
            }
          } catch (e) {
            console.error("Error parsing user profile:", e);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setJobOpenings([]);
        setAdminCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchData();
  }, []);

  const handleApplyJob = async (job) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      toast.error("Please login as a student to apply for this job.");
      navigate("/login?role=student", { state: { redirectTo: "/student", requestedRole: "student" } });
      return;
    }

    let user = {};
    try {
      user = JSON.parse(userStr);
    } catch (e) {}

    const studentId = user.id || user.user_id;
    const studentName = user.name || "Student";
    const studentEmail = user.email || "";

    setSubmittingJobId(job.id);
    try {
      const response = await api.post(`/jobs/${job.id}/apply`, {
        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,
        job_title: job.role,
        company: job.company
      });

      toast.success(response.data.message || `Successfully applied for ${job.role}!`);
      setAppliedJobIds(prev => [...prev, Number(job.id)]);
    } catch (error) {
      console.error("Apply job error:", error);
      const errMsg = error.response?.data?.message || "Failed to apply for job. Please try again.";
      if (errMsg.includes("already applied")) {
        setAppliedJobIds(prev => [...prev, Number(job.id)]);
      }
      toast.error(errMsg);
    } finally {
      setSubmittingJobId(null);
    }
  };

  return (
    <div className="home-dashboard">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <h2 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>🎓 Placement Portal</h2>
          </div>
          <div className="navbar-menu">
            <button className="nav-btn" onClick={() => handleDashboardAccess("/student", "student")}>👨‍🎓 Student</button>
            <button className="nav-btn" onClick={() => handleDashboardAccess("/admin", "admin")}>👔 Admin</button>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-container">
          <div className="welcome-card">
            <div className="profile-pic">
              <img src={logo} alt="Placement Portal Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} />
            </div>
            <div className="welcome-content">
              <h1>Welcome to BVICAM Placement Portal</h1>
              <p>Your gateway to career opportunities</p>
              <p className="welcome-subtitle">Explore companies, apply for jobs, and track your placements all in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section - Hidden if no jobs */}
      {jobOpenings.length > 0 && (
        <section className="jobs-section">
          <h2 className="section-title">💼 Recent Job Openings</h2>
          <div className="jobs-grid">
            {jobOpenings.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.company}</h3>
                  <p className="job-role">{job.role}</p>
                </div>
                <div className="job-details">
                  <p><strong>💰 Package:</strong> {job.package}</p>
                  <p><strong>📅 Deadline:</strong> {job.deadline}</p>
                </div>
                {appliedJobIds.includes(Number(job.id)) ? (
                  <button className="btn-apply btn-applied" disabled>
                    ✓ Applied
                  </button>
                ) : (
                  <button
                    className="btn-apply"
                    onClick={() => handleApplyJob(job)}
                    disabled={submittingJobId === job.id}
                  >
                    {submittingJobId === job.id ? "Applying..." : "Apply Now"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Admin Created Recruiting Companies Section - Hidden if no companies */}
      {(loadingCompanies || adminCompanies.length > 0) && (
        <section className="companies-section-home">
          <h2 className="section-title">🏢 Recruiting Companies</h2>
          {loadingCompanies ? (
            <div className="home-companies-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="admin-style-company-card shimmer-card">
                  <div className="shimmer-avatar"></div>
                  <div className="shimmer-text"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-companies-grid">
              {adminCompanies.map((company) => {
                const initial = company.name ? company.name.charAt(0).toUpperCase() : "C";
                const websiteUrl = company.website
                  ? /^https?:\/\//i.test(company.website)
                    ? company.website
                    : `https://${company.website}`
                  : null;

                return (
                  <div key={company.id} className="admin-style-company-card">
                    <div className="company-card-header">
                      <div className="company-avatar-wrapper">
                        <div className="company-avatar">{initial}</div>
                        <div className="company-title-info">
                          <div className="company-name-row">
                            {websiteUrl ? (
                              <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="company-name-link"
                                title={`Visit ${company.name} website (${company.website})`}
                              >
                                <h4 className="company-name">{company.name}</h4>
                                <ExternalLink size={14} className="link-icon" />
                              </a>
                            ) : (
                              <h4 className="company-name" title={company.name}>{company.name}</h4>
                            )}
                          </div>
                          <span className="company-industry-tag">
                            {company.industry || "General"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="company-info-list">
                      <div className="company-info-item">
                        <MapPin size={16} />
                        <span title={company.location}>{company.location || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}



      {/* Contact Information */}
      <section className="contact-section">
        <div className="contact-container">
          <h2 className="section-title">📞 Contact Information</h2>
          <div className="contact-card">
            <h3>Dr. Saumya Bansal </h3>
            <p className="contact-position">Faculty Coordinator, T & P Cell BVICAM</p>
            <div className="contact-details">
              <p><strong>Mob:</strong> +91-8130846470, +91-8130176573, +91-9220925051</p>
              <p><strong>e-Mail:</strong> <a href="mailto:placements@bvicam.ac.in">placements@bvicam.ac.in</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* Institute Information */}
      <section className="institute-section">
        <div className="institute-container">
          <h2 className="section-title">🏛️ Institute Information</h2>
          <div className="institute-card">
            <h3>Bharati Vidyapeeth's</h3>
            <h4>Institute of Computer Applications and Management (BVICAM)</h4>
            <div className="institute-details">
              <p className="institute-address">
                A-4, Paschim Vihar, Near Paschim Vihar (East) Metro Station,<br />
                Rohtak Road, New Delhi-110063
              </p>
              <div className="institute-contact">
                <p><strong>Tel:</strong> +91-8130176573, +91-9220925051</p>
                <p><strong>E-Mail:</strong> <a href="mailto:placements@bvicam.ac.in">placements@bvicam.ac.in</a>, <a href="mailto:mca@bvicam.ac.in">mca@bvicam.ac.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2026 BVICAM Placement Portal New Delhi . All rights reserved.</p>
      </footer>
    </div>
  );
}
