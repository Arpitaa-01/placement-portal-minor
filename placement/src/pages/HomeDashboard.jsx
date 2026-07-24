import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/HomeDashboard.css";
import logo from '../picture/logo.png';

export default function HomeDashboard() {
  const navigate = useNavigate();

  const handleDashboardAccess = (dashboard, role) => {
    // Redirect to login for all dashboard access with role and redirect info
    navigate(`/login?role=${role}`, { state: { redirectTo: dashboard, requestedRole: role } });
  };
  const [stats] = useState({
    totalStudents: 450,
    totalCompanies: 28,
    totalJobs: 85,
    applicationsSubmitted: 1200,
    studentsPlaced: 380,
    upcomingInterviews: 42,
  });

  const [announcements] = useState([
    { id: 1, title: "Infosys Placement Drive", date: "2024-03-15", status: "upcoming", company: "infosys" },
    { id: 2, title: "TCS Interview Results", date: "2024-03-10", status: "new", company: "tcs" },
    { id: 3, title: "Amazon Pre-Placement Talk", date: "2024-03-08", status: "new", company: "amazon" },
  ]);

  const [companyDetails] = useState({
    infosys: {
      name: "Infosys Limited",
      logo: "🔹",
      description: "Infosys is a global leader in consulting, technology, and outsourcing services.",
      founded: "1981",
      headquarters: "Bangalore, India",
      employees: "300,000+",
      website: "www.infosys.com",
      packageInfo: {
        base: "6.5 LPA",
        signing: "1.25 LPA",
        ctc: "7.75 LPA"
      },
      eligibility: "60% CGPA",
      roles: ["Software Engineer", "Data Analyst", "Solutions Architect"],
      interview: "3 rounds - Online Test, Technical Interview, HR Round",
      details: "Infosys will be visiting campus on March 15th, 2024 for their annual placement drive. They are looking for talented individuals with strong problem-solving skills. Candidates with CGPA 6.0 and above are eligible to apply.",
      benefits: ["Competitive salary", "Health insurance", "Flexible work hours", "Career development", "Global exposure", "Performance bonus"]
    },
    tcs: {
      name: "Tata Consultancy Services (TCS)",
      logo: "🔷",
      description: "TCS is an IT services, consulting and business solutions organization with over 20 years of experience.",
      founded: "1968",
      headquarters: "Mumbai, India",
      employees: "500,000+",
      website: "www.tcs.com",
      packageInfo: {
        base: "5.5 LPA",
        signing: "1.0 LPA",
        ctc: "6.5 LPA"
      },
      eligibility: "55% CGPA",
      roles: ["System Engineer", "IT Professional", "Business Analyst"],
      interview: "3 rounds - Written Test, Technical Interview, HR Round",
      details: "TCS is India's most valuable IT services company and a leading global IT services provider. The recruitment drive will be held on March 10-12, 2024. They value leadership qualities and innovative thinking.",
      benefits: ["Competitive salary", "Medical insurance", "Educational assistance", "Stock options", "Work-life balance", "International assignments"]
    },
    amazon: {
      name: "Amazon Web Services (AWS)",
      logo: "🛒",
      description: "Amazon is a global e-commerce and cloud computing leader revolutionizing industries worldwide.",
      founded: "1994",
      headquarters: "Seattle, USA",
      employees: "1,500,000+",
      website: "www.amazon.com",
      packageInfo: {
        base: "8.5 LPA",
        signing: "1.5 LPA",
        ctc: "10.0 LPA"
      },
      eligibility: "65% CGPA",
      roles: ["SDE (Backend/Frontend)", "Cloud Engineer", "Solutions Architect"],
      interview: "4 rounds - Online Assessment, 2x Technical, Bar Raiser Round",
      details: "Amazon is hosting a pre-placement talk on March 8th to discuss career opportunities in cloud computing and software development. This is an excellent opportunity to learn from industry experts and understand Amazon's culture.",
      benefits: ["Highest Salary in industry", "Stock benefits", "Health & wellness", "Free AWS training", "Relocation assistance", "International opportunities"]
    }
  });

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const handleReadMore = (annId) => {
    const ann = announcements.find(a => a.id === annId);
    setSelectedAnnouncement(ann);
    setShowCompanyModal(true);
  };

  const [jobOpenings, setJobOpenings] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobOpenings(response.data.map(job => ({
          id: job.id,
          company: job.company,
          role: job.title,
          package: job.salary,
          deadline: job.deadline
        })));
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Fallback to static data if API fails
        setJobOpenings([
          { id: 1, company: "Infosys", role: "Software Engineer", package: "6.5 LPA", deadline: "2024-03-20" },
          { id: 2, company: "TCS", role: "System Engineer", package: "5.5 LPA", deadline: "2024-03-18" },
          { id: 3, company: "Wipro", role: "Full Stack Developer", package: "7 LPA", deadline: "2024-03-25" },
          { id: 4, company: "Accenture", role: "Java Developer", package: "6 LPA", deadline: "2024-03-22" },
        ]);
      }
    };
    fetchJobs();
  }, []);

  const [upcomingInterviews] = useState([
    { id: 1, company: "Infosys", date: "2024-03-15 10:00 AM", location: "Campus", type: "Online" },
    { id: 2, company: "TCS", date: "2024-03-16 02:00 PM", location: "Main Hall", type: "Offline" },
    { id: 3, company: "Wipro", date: "2024-03-17 09:30 AM", location: "Campus", type: "Online" },
  ]);

  const [notifications] = useState([
    { id: 1, type: "Application", message: "Your application for Infosys was received", time: "2 hours ago" },
    { id: 2, type: "Interview", message: "You are shortlisted for TCS interview", time: "5 hours ago" },
    { id: 3, type: "Company", message: "Google announced a new placement drive", time: "1 day ago" },
    { id: 4, type: "Result", message: "You have been placed at Infosys!", time: "3 days ago" },
  ]);

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
            {/* <button className="nav-btn" onClick={() => handleDashboardAccess("/controller", "controller")}>🛡️ Controller</button> */}
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

      {/* Statistics Cards */}
      <section className="statistics-section">
        <h2 className="section-title">📊 Placement Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>{stats.totalCompanies}</h3>
              <p>Companies Visiting</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{stats.totalJobs}</h3>
              <p>Job Openings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.applicationsSubmitted}</h3>
              <p>Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.studentsPlaced}</h3>
              <p>Students Placed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.upcomingInterviews}</h3>
              <p>Upcoming Interviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="announcements-section">
        <h2 className="section-title">📢 Latest Announcements</h2>
        <div className="announcements-grid">
          {announcements.map((ann) => (
            <div key={ann.id} className="announcement-card">
              <div className="announcement-badge">{ann.status === "new" ? "🆕 NEW" : "📅 UPCOMING"}</div>
              <h3>{ann.title}</h3>
              <p className="announcement-date">📅 {ann.date}</p>
              <button className="btn-read-more" onClick={() => handleReadMore(ann.id)}>Read More →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Company Details Modal */}
      {showCompanyModal && selectedAnnouncement && (
        <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="company-header">
                <span className="company-logo">{companyDetails[selectedAnnouncement.company].logo}</span>
                <h2>{companyDetails[selectedAnnouncement.company].name}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowCompanyModal(false)}>✕</button>
            </div>

            <div className="company-details-body">
              {/* Basic Company Info */}
              <div className="company-info-grid">
                <div className="info-section">
                  <h3>About Company</h3>
                  <p className="section-description">{companyDetails[selectedAnnouncement.company].description}</p>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="label">Founded:</span>
                      <span className="value">{companyDetails[selectedAnnouncement.company].founded}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Headquarters:</span>
                      <span className="value">{companyDetails[selectedAnnouncement.company].headquarters}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Employees:</span>
                      <span className="value">{companyDetails[selectedAnnouncement.company].employees}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Website:</span>
                      <span className="value">{companyDetails[selectedAnnouncement.company].website}</span>
                    </div>
                  </div>
                </div>

                {/* Recruitment Details */}
                <div className="info-section">
                  <h3>Recruitment Details</h3>
                  <p className="section-description">{companyDetails[selectedAnnouncement.company].details}</p>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="label">Eligibility:</span>
                      <span className="value">{companyDetails[selectedAnnouncement.company].eligibility}</span>
                    </div>
                  </div>
                </div>

                {/* Package & Roles */}
                <div className="info-section">
                  <h3>Package & Roles</h3>
                  <div className="package-grid">
                    <div className="package-item">
                      <span className="package-label">Base Salary</span>
                      <span className="package-value">{companyDetails[selectedAnnouncement.company].packageInfo.base}</span>
                    </div>
                    <div className="package-item">
                      <span className="package-label">Signing Bonus</span>
                      <span className="package-value">{companyDetails[selectedAnnouncement.company].packageInfo.signing}</span>
                    </div>
                    <div className="package-item">
                      <span className="package-label">Total CTC</span>
                      <span className="package-value package-highlight">{companyDetails[selectedAnnouncement.company].packageInfo.ctc}</span>
                    </div>
                  </div>
                  <div className="roles-section">
                    <p className="roles-label">Available Roles:</p>
                    <div className="tags">
                      {companyDetails[selectedAnnouncement.company].roles.map((role, idx) => (
                        <span key={idx} className="tag">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interview Process */}
                <div className="info-section">
                  <h3>Interview Process</h3>
                  <p className="interview-description">{companyDetails[selectedAnnouncement.company].interview}</p>
                </div>

                {/* Benefits */}
                <div className="info-section">
                  <h3>Employee Benefits</h3>
                  <div className="benefits-list">
                    {companyDetails[selectedAnnouncement.company].benefits.map((benefit, idx) => (
                      <div key={idx} className="benefit-item">
                        <span className="benefit-check">✓</span>
                        <span className="benefit-text">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-apply-modal" onClick={() => handleDashboardAccess("/student", "student")}>
                Apply Now
              </button>
              <button className="btn-close-modal" onClick={() => setShowCompanyModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}


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
              <button className="btn-apply" onClick={() => handleDashboardAccess("/student", "student")}>Apply Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Interviews */}
      <section className="interviews-section">
        <h2 className="section-title">📅 Upcoming Interviews & Events</h2>
        <div className="events-grid">
          {upcomingInterviews.map((interview) => (
            <div key={interview.id} className="event-card">
              <div className="event-icon">🎤</div>
              <div className="event-content">
                <h3>{interview.company}</h3>
                <p><strong>📅 Date & Time:</strong> {interview.date}</p>
                <p><strong>📍 Location:</strong> {interview.location}</p>
                <p><strong>🌐 Mode:</strong> {interview.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Placement Statistics */}
      <section className="placement-stats-section">
        <h2 className="section-title">📈 Placement Statistics</h2>
        <div className="stats-containers">
          <div className="stat-box">
            <div className="stat-number">{((stats.studentsPlaced / stats.totalStudents) * 100).toFixed(1)}%</div>
            <div className="stat-label">Placement Rate</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.studentsPlaced}</div>
            <div className="stat-label">Students Placed</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.totalCompanies}</div>
            <div className="stat-label">Recruiting Companies</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">6.5 LPA</div>
            <div className="stat-label">Avg Package</div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="notifications-section">
        <h2 className="section-title">🔔 Recent Notifications</h2>
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-item notif-${notif.type.toLowerCase()}`}>
              <div className="notif-icon">
                {notif.type === "Application" && "📋"}
                {notif.type === "Interview" && "🎤"}
                {notif.type === "Company" && "🏢"}
                {notif.type === "Result" && "✅"}
              </div>
              <div className="notif-content">
                <h4>{notif.type}</h4>
                <p>{notif.message}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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

      {/* Important Links & Contact */}
      <section className="links-contact-section">
        <div className="links-contact-container">
          <div className="links-section">
            <h3>🔗 Important Links</h3>
            <div className="links-grid">
              <a href="#" className="link-item">Contact Us</a>
              <a href="#" className="link-item">SGRC</a>
              <a href="#" className="link-item">NIRF Data</a>
              <a href="#" className="link-item">Mandatory Disclosure - Academic Audit</a>
              <a href="#" className="link-item">Blog</a>
              <a href="#" className="link-item">Privacy Policy</a>
              <a href="#" className="link-item">Grievances Redressal</a>
              <a href="#" className="link-item">GGSIPU</a>
              <a href="#" className="link-item">BVP</a>
              <a href="#" className="link-item">UGC</a>
              <a href="#" className="link-item">AICTE (Mandatory Disclosures)</a>
              <a href="#" className="link-item">AICTE (EoA)</a>
              <a href="#" className="link-item">Feedback to AICTE</a>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="contact-info-item">
              <div className="contact-icon">📍</div>
              <div className="contact-details">
                <h4>Address</h4>
                <p>A-4, Paschim Vihar, Rohtak Road, New Delhi - 110063 (INDIA)</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <h4>Phone</h4>
                <p>+91-8826883338, +91-8826883339</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">✉️</div>
              <div className="contact-details">
                <h4>Email</h4>
                <p><a href="mailto:mca@bvicam.ac.in">mca@bvicam.ac.in</a></p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-icon">🎥</div>
              <div className="contact-details">
                <h4>Virtual Tour</h4>
                <a href="#" className="virtual-tour-link">Virtual Tour</a>
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
