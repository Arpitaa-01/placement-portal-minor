import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load user data from localStorage
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const computeProfileCompletion = (profile) => {
    const completedFields = [
      !!profile.name,
      !!profile.email,
      !!profile.enrollment,
      !!profile.course,
      !!profile.batchYear,
      !!profile.resume,
      profile.cgpa > 0,
    ].filter(Boolean).length;
    return Math.round((completedFields / 7) * 100);
  };

  useEffect(() => {
    const loadStudentProfile = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        // Try to fetch student profile from API
        try {
          const studentsResponse = await api.get('/students');
          const students = studentsResponse.data;
          // Find the student by email
          const currentStudent = students.find(s => s.email === userData.email);
          if (currentStudent) {
            const profile = {
              id: currentStudent.id,
              name: currentStudent.name || userData.name || "Student",
              email: currentStudent.email || userData.email || "",
              enrollment: currentStudent.enrollment || userData.enrollment || "",
              course: currentStudent.course || userData.course || "MCA",
              batchYear: currentStudent.batchYear || userData.batchYear || "",
              cgpa: currentStudent.cgpa || 0,
              resume: currentStudent.resume || userData.resume || "",
              profileVerified: currentStudent.profileVerified || false,
            };
            const fullProfile = {
              ...profile,
              profileCompletion: currentStudent.profileCompletion ?? computeProfileCompletion(profile),
            };
            setStudentProfile(fullProfile);
            setProfileForm(fullProfile);
          } else {
            const profile = {
              name: userData.name || "Student",
              email: userData.email || "",
              enrollment: userData.enrollment || "",
              course: userData.course || "MCA",
              batchYear: userData.batchYear || "",
              cgpa: userData.cgpa || 0,
              resume: userData.resume || "",
              profileVerified: userData.profileVerified || false,
            };
            const fullProfile = {
              ...profile,
              profileCompletion: userData.profileCompletion ?? computeProfileCompletion(profile),
            };
            setStudentProfile(fullProfile);
            setProfileForm(fullProfile);
          }
        } catch (error) {
          console.error('Error fetching student profile:', error);
          // Fallback to user data
          setStudentProfile({
            name: userData.name || "Student",
            email: userData.email || "",
            phone: userData.phone || "",
            course: userData.course || "MCA",
            branch: userData.branch || "Computer Science",
            cgpa: userData.cgpa || 0,
            skills: userData.skills || [],
            certifications: userData.certifications || [],
            projects: userData.projects || [],
            profileCompletion: userData.profileCompletion || 0,
            profileVerified: userData.profileVerified || false,
          });
        }
      } else {
        // If no user data, redirect to login
        navigate("/login", { state: { redirectTo: "/student", requestedRole: "student" } });
      }
      setLoading(false);
    };

    loadStudentProfile();
  }, [navigate]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); // Prevent form submission and page refresh
    
    if (!profileForm.name || !profileForm.email || !profileForm.enrollment || !profileForm.course || !profileForm.batchYear || !profileForm.resume) {
      alert("Please complete all required profile fields before saving.");
      return;
    }

    const updatedProfile = {
      ...profileForm,
      profileCompletion: computeProfileCompletion(profileForm),
    };

    if (studentProfile?.id) {
      try {
        await api.put(`/students/${studentProfile.id}`, {
          name: profileForm.name,
          year: profileForm.batchYear,
          cgpa: profileForm.cgpa,
          resume: profileForm.resume,
          registrationStatus: studentProfile.registrationStatus || "pending",
          applicationStatus: studentProfile.applicationStatus || "Applied",
        });
      } catch (error) {
        console.warn("Unable to save profile to API, saving locally instead.", error);
      }
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      localStorage.setItem("user", JSON.stringify({
        ...userData,
        ...profileForm,
        profileCompletion: updatedProfile.profileCompletion,
      }));
    }

    setStudentProfile(updatedProfile);
    setProfileForm(updatedProfile);
    setIsEditingProfile(false);
    setSuccessMessage("Profile saved successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartEditingProfile = () => {
    setProfileForm(studentProfile);
    setIsEditingProfile(true);
  };

  const handleCancelProfileEdit = () => {
    setProfileForm(studentProfile);
    setIsEditingProfile(false);
  };

  const [resumeFiles, setResumeFiles] = useState([
    { id: 1, name: "Resume_v1.pdf", uploadDate: "2024-02-15", isActive: true, size: "245 KB" },
    { id: 2, name: "Resume_v2.pdf", uploadDate: "2024-03-01", isActive: false, size: "267 KB" },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [previewResume, setPreviewResume] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [appliedJobs, setAppliedJobs] = useState([
    {
      id: 1,
      company: "TCS",
      role: "Software Engineer",
      appliedDate: "2024-02-20",
      status: "Shortlisted",
      salary: "6.5 LPA",
    },
    {
      id: 2,
      company: "Infosys",
      role: "Java Developer",
      appliedDate: "2024-02-25",
      status: "Interview Scheduled",
      salary: "7 LPA",
    },
    {
      id: 3,
      company: "Wipro",
      role: "Full Stack Developer",
      appliedDate: "2024-03-01",
      status: "Applied",
      salary: "7.5 LPA",
    },
  ]);

  const [interviews] = useState([
    {
      id: 1,
      company: "TCS",
      role: "Software Engineer",
      dateTime: "2024-03-10 10:00 AM",
      mode: "Online",
      link: "https://meet.google.com/abc",
    },
    {
      id: 2,
      company: "Infosys",
      role: "Java Developer",
      dateTime: "2024-03-15 02:00 PM",
      mode: "Offline",
      venue: "Infosys Campus, Bangalore",
    },
  ]);

  const [notifications] = useState([
    { id: 1, type: "New Job", message: "Accenture posted new positions" },
    { id: 2, type: "Interview", message: "Your interview with TCS is scheduled" },
    { id: 3, type: "Result", message: "You are shortlisted for Infosys" },
    { id: 4, type: "Drive", message: "Cognizant placement drive starts next week" },
  ]);

  const [allJobs] = useState([
    {
      id: 1,
      company: "TCS",
      role: "Software Engineer",
      salary: "6.5 LPA",
      location: "Bangalore",
      eligibility: "CGPA >= 7.0",
      skills: ["Java", "Python"],
      deadline: "2024-03-20",
    },
    {
      id: 2,
      company: "Infosys",
      role: "Java Developer",
      salary: "7 LPA",
      location: "Pune",
      eligibility: "CGPA >= 7.5",
      skills: ["Java", "Spring Boot"],
      deadline: "2024-03-22",
    },
    {
      id: 3,
      company: "Wipro",
      role: "Full Stack Developer",
      salary: "7.5 LPA",
      location: "Hyderbad",
      eligibility: "CGPA >= 8.0",
      skills: ["React", "Node.js"],
      deadline: "2024-03-25",
    },
  ]);

  const [companies] = useState([
    {
      id: 1,
      name: "TCS",
      hiringFor: 50,
      avgSalary: "6.5 LPA",
      roles: ["Software Engineer", "System Engineer"],
      visited: "2024-02-10",
    },
    {
      id: 2,
      name: "Infosys",
      hiringFor: 35,
      avgSalary: "7 LPA",
      roles: ["Java Developer", "Web Developer"],
      visited: "2024-02-15",
    },
    {
      id: 3,
      name: "Wipro",
      hiringFor: 40,
      avgSalary: "7.5 LPA",
      roles: ["Full Stack Developer", "DevOps Engineer"],
      visited: "2024-02-20",
    },
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    phoneNumber: "9876543210",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(settings.phoneNumber);
  const [successMessage, setSuccessMessage] = useState("");

  const handleNotificationToggle = (type) => {
    setSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
    setSuccessMessage(`${type === "emailNotifications" ? "Email" : "SMS"} notifications ${!settings[type] ? "enabled" : "disabled"}.`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handlePhoneUpdate = () => {
    if (phoneInput.trim() === "") {
      alert("Phone number cannot be empty.");
      return;
    }
    if (!/^\d{10}$/.test(phoneInput)) {
      alert("Phone number must be 10 digits.");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      phoneNumber: phoneInput,
    }));
    setEditingPhone(false);
    setSuccessMessage("Phone number updated successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("All fields are required.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    setSuccessMessage("Password changed successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordModal(false);
  };

  const handleResumeUpload = () => {
    if (!uploadedFileName.trim()) {
      alert("Please select a file to upload.");
      return;
    }
    if (!uploadedFileName.endsWith(".pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }
    const newResume = {
      id: Date.now(),
      name: uploadedFileName,
      uploadDate: new Date().toLocaleDateString("en-CA"),
      isActive: false,
      size: `${Math.floor(Math.random() * 300 + 200)} KB`,
    };
    setResumeFiles([...resumeFiles, newResume]);
    setSuccessMessage("Resume uploaded successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
    setUploadedFileName("");
    setShowUploadModal(false);
  };

  const handlePreviewResume = (file) => {
    setPreviewResume(file);
    setShowPreviewModal(true);
  };

  const handleDownloadResume = (file) => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj5lbmRvYmoKMyAwIG9iajw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNjEyIDc5Ml0vUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vQ29udGVudHMgNSAwIFI+PmVuZG9iagogIDQgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PmVuZG9iagogIDUgMCBvYmo8PC9MZW5ndGggNDQvRmlsdGVyL0ZsYXRlRGVjb2RlPj5zdHJlYW0KeJzDKCkpLEpRKC4pAhMKMnJygKLw0jI6AElBg0QgqQhcH5QEQX1+TkQ+Fw0KZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA3NiAwMDAwMCBuIAowMDAwMDAwMTMzIDAwMDAwIG4gCjAwMDAwMDAyNzQgMDAwMDAgbiAKMDAwMDAwMDM3MCAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDY1CiUlRU9G`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage(`Downloaded ${file.name}`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSetActiveResume = (fileId) => {
    setResumeFiles(
      resumeFiles.map((file) => ({
        ...file,
        isActive: file.id === fileId,
      }))
    );
    setSuccessMessage("Resume set as active.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setStudentProfile(null);
    navigate("/");
  };

  const handleApplyJob = (job) => {
    setAppliedJobs([...appliedJobs, {
      id: Date.now(),
      company: job.company,
      role: job.role,
      appliedDate: new Date().toLocaleDateString(),
      status: "Applied",
      salary: job.salary,
    }]);
    alert(`Applied for ${job.role} at ${job.company}!`);
  };

  // Dashboard Overview
  const DashboardOverview = () => {
    const stats = [
      { icon: "📄", label: "Total Jobs Available", value: allJobs.length },
      { icon: "📝", label: "Jobs Applied", value: appliedJobs.length },
      { icon: "⏳", label: "In Process", value: appliedJobs.filter(j => j.status === "Applied").length },
      { icon: "✅", label: "Shortlisted", value: appliedJobs.filter(j => j.status === "Shortlisted").length },
      { icon: "🎯", label: "Offers", value: 0 },
      { icon: "📅", label: "Interviews", value: interviews.length },
    ];

    return (
      <div className="section-content">
        <h2>Dashboard Overview</h2>
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="progress-section">
          <h3>Your Placement Progress</h3>
          <div className="progress-tracker">
            <div className="progress-step completed">
              <div className="step-circle">✓</div>
              <p>Profile</p>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step completed">
              <div className="step-circle">✓</div>
              <p>Applied</p>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step active">
              <div className="step-circle">2</div>
              <p>Shortlist</p>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-circle">4</div>
              <p>Interview</p>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-circle">5</div>
              <p>Selected</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Section
  const ProfileSection = () => {
    return (
      <div className="section-content">
        <h2>{studentProfile.name}'s Profile</h2>
        <div className="profile-completion">
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${studentProfile.profileCompletion}%` }}></div>
          </div>
          <p>Profile {studentProfile.profileCompletion}% Complete</p>
          {studentProfile.profileCompletion < 50 && (
            <p className="completion-alert">Your profile is incomplete. Update your details to improve placement recommendations.</p>
          )}
          {studentProfile.profileVerified && (
            <p className="verified-badge">✓ Profile Verified by Admin</p>
          )}
          <button className="btn-submit" onClick={handleStartEditingProfile}>
            {isEditingProfile ? "Editing Profile" : "Complete Profile"}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="profile-edit-form">
            {successMessage && <div className="success-message">✓ {successMessage}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleProfileInputChange} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={profileForm.email} onChange={handleProfileInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Enrollment Number *</label>
                <input type="text" name="enrollment" value={profileForm.enrollment} onChange={handleProfileInputChange} />
              </div>
              <div className="form-group">
                <label>Course *</label>
                <input type="text" name="course" value={profileForm.course} onChange={handleProfileInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Batch Year *</label>
                <input type="text" name="batchYear" value={profileForm.batchYear} onChange={handleProfileInputChange} />
              </div>
              <div className="form-group">
                <label>CGPA</label>
                <input type="number" step="0.01" name="cgpa" value={profileForm.cgpa} onChange={handleProfileInputChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Resume URL or filename *</label>
              <input type="text" name="resume" value={profileForm.resume} onChange={handleProfileInputChange} />
            </div>
            <div className="button-row">
              <button className="btn-submit" onClick={handleSaveProfile}>Save Profile</button>
              <button className="btn-cancel" onClick={handleCancelProfileEdit} type="button">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-card">
              <h3>Personal Details</h3>
              <div className="profile-field"><label>Name:</label><p>{studentProfile.name}</p></div>
              <div className="profile-field"><label>Email:</label><p>{studentProfile.email}</p></div>
              <div className="profile-field"><label>Enrollment:</label><p>{studentProfile.enrollment || "Not set"}</p></div>
            </div>
            <div className="profile-card">
              <h3>Academic Details</h3>
              <div className="profile-field"><label>Course:</label><p>{studentProfile.course}</p></div>
              <div className="profile-field"><label>Batch Year:</label><p>{studentProfile.batchYear || "Not set"}</p></div>
              <div className="profile-field"><label>CGPA:</label><p>{studentProfile.cgpa}</p></div>
            </div>
            <div className="profile-card">
              <h3>Resume</h3>
              <div className="profile-field"><label>Resume:</label><p>{studentProfile.resume || "No resume set"}</p></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Resume Section
  const ResumeSection = () => {
    return (
      <div className="section-content">
        <h2>Resume Management</h2>
        {successMessage && <div className="success-message">✓ {successMessage}</div>}
        <div className="resume-upload">
          <button className="btn-submit" onClick={() => setShowUploadModal(true)}>📤 Upload New Resume</button>
        </div>
        <div className="resume-list">
          <h3>Your Resumes ({resumeFiles.length})</h3>
          {resumeFiles.length === 0 ? (
            <p className="no-resumes">No resumes uploaded yet. Upload your first resume to get started.</p>
          ) : (
            resumeFiles.map((file) => (
              <div key={file.id} className="resume-item">
                <div className="resume-info">
                  <div className="resume-details">
                    <p className="resume-name">📄 {file.name}</p>
                    <p className="resume-meta">Uploaded: {file.uploadDate} • Size: {file.size}</p>
                  </div>
                  {file.isActive && <span className="active-badge">⭐ Active</span>}
                </div>
                <div className="resume-actions">
                  <button className="btn-small" onClick={() => handlePreviewResume(file)}>👁 Preview</button>
                  <button className="btn-small" onClick={() => handleDownloadResume(file)}>📥 Download</button>
                  {!file.isActive && (
                    <button className="btn-small" onClick={() => handleSetActiveResume(file.id)}>⭐ Set Active</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Resume Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Upload New Resume</h3>
                <button className="modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select PDF File:</label>
                  <input
                    type="text"
                    value={uploadedFileName}
                    onChange={(e) => setUploadedFileName(e.target.value)}
                    placeholder="e.g., Resume_Bharat_2024.pdf"
                  />
                  <p className="file-hint">Tip: Enter a descriptive filename. Only PDF files are supported.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFileName("");
                }}>Cancel</button>
                <button className="btn-submit" onClick={handleResumeUpload}>Upload Resume</button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Resume Modal */}
        {showPreviewModal && previewResume && (
          <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📄 {previewResume.name}</h3>
                <button className="modal-close" onClick={() => setShowPreviewModal(false)}>✕</button>
              </div>
              <div className="modal-body preview-body">
                <div className="pdf-preview">
                  <div className="pdf-placeholder">
                    <p>📄 PDF Preview</p>
                    <p className="preview-text">{previewResume.name}</p>
                    <p className="preview-meta">Size: {previewResume.size} | Uploaded: {previewResume.uploadDate}</p>
                    <div className="preview-content">
                      <p><strong>BHARAT BHUSAN</strong></p>
                      <p>📧 bharatbhusan.mca25@bvicam.in | 📞 9871939313</p>
                      <p>Bangalore, India</p>
                      <hr />
                      <h4>PROFESSIONAL SUMMARY</h4>
                      <p>Experienced Java Developer with strong expertise in Spring Boot, React, and cloud technologies. Proven track record of delivering scalable solutions.</p>
                      <h4>SKILLS</h4>
                      <p>Java, Python, React, Spring Boot, RESTful APIs, MySQL, AWS, Docker, Git</p>
                      <h4>EXPERIENCE</h4>
                      <p><strong>Software Developer Intern</strong> - Tech Company (Jan 2024 - Present)</p>
                      <p>Developed and maintained REST APIs using Spring Boot. Collaborated with cross-functional teams.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-submit" onClick={() => handleDownloadResume(previewResume)}>📥 Download</button>
                <button className="btn-cancel" onClick={() => setShowPreviewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Jobs Section
  const JobsSection = () => {
    return (
      <div className="section-content">
        <h2>Job Opportunities</h2>
        <div className="jobs-grid">
          {allJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.company}</h3>
                <p className="job-role">{job.role}</p>
              </div>
              <div className="job-details">
                <p><strong>Salary:</strong> {job.salary}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Eligibility:</strong> {job.eligibility}</p>
                <p><strong>Deadline:</strong> {job.deadline}</p>
                <div className="skills-tags">
                  {job.skills.map((skill, idx) => <span key={idx} className="skill-tag">{skill}</span>)}
                </div>
              </div>
              <div className="job-actions">
                <button className="btn-apply" onClick={() => handleApplyJob(job)}>Apply</button>
                <button className="btn-save">💾 Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Applications Section
  const ApplicationsSection = () => {
    return (
      <div className="section-content">
        <h2>My Applications</h2>
        <div className="table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Applied Date</th>
                <th>Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.company}</td>
                  <td>{job.role}</td>
                  <td>{job.appliedDate}</td>
                  <td>{job.salary}</td>
                  <td><span className={`status-badge status-${job.status.replace(/\s+/g, "-").toLowerCase()}`}>{job.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Interviews Section
  const InterviewsSection = () => {
    return (
      <div className="section-content">
        <h2>Interview Schedule</h2>
        <div className="interviews-grid">
          {interviews.map((interview) => (
            <div key={interview.id} className="interview-card">
              <div className="interview-header">
                <h3>{interview.company}</h3>
                <p className="interview-role">{interview.role}</p>
              </div>
              <div className="interview-details">
                <p><strong>📅 Date & Time:</strong> {interview.dateTime}</p>
                <p><strong>📍 Mode:</strong> {interview.mode}</p>
                {interview.link && <p><strong>🔗 Link:</strong> <a href={interview.link} target="_blank" rel="noreferrer">Join</a></p>}
                {interview.venue && <p><strong>📍 Venue:</strong> {interview.venue}</p>}
              </div>
              <button className="btn-submit">Add to Calendar</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Notifications Section
  const NotificationsSection = () => {
    return (
      <div className="section-content">
        <h2>Notifications & Announcements</h2>
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-item notif-${notif.type.toLowerCase()}`}>
              <div className="notif-icon">🔔</div>
              <div className="notif-content">
                <p className="notif-type">{notif.type}</p>
                <p className="notif-message">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Companies Section
  const CompaniesSection = () => {
    return (
      <div className="section-content">
        <h2>Companies Visiting Campus</h2>
        <div className="companies-grid">
          {companies.map((company) => (
            <div key={company.id} className="company-card">
              <div className="company-header">
                <h3>{company.name}</h3>
                <p className="visited-date">Last Visit: {company.visited}</p>
              </div>
              <div className="company-details">
                <p><strong>Hiring:</strong> {company.hiringFor} Positions</p>
                <p><strong>Avg Salary:</strong> {company.avgSalary}</p>
                <div className="roles-list">
                  <strong>Job Roles:</strong>
                  {company.roles.map((role, idx) => <p key={idx}>• {role}</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Settings Section
  const SettingsSection = () => {
    return (
      <div className="section-content">
        <h2>Settings</h2>
        {successMessage && <div className="success-message">✓ {successMessage}</div>}
        <div className="settings-grid">
          <div className="settings-card">
            <h3>Notification Preferences</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleNotificationToggle("emailNotifications")}
                />
                Email Notifications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleNotificationToggle("smsNotifications")}
                />
                SMS Notifications
              </label>
            </div>
          </div>
          <div className="settings-card">
            <h3>Contact Details</h3>
            {editingPhone ? (
              <div className="setting-item">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="10-digit phone number"
                />
                <div className="phone-buttons">
                  <button className="btn-small btn-save" onClick={handlePhoneUpdate}>
                    Save
                  </button>
                  <button
                    className="btn-small btn-cancel"
                    onClick={() => {
                      setEditingPhone(false);
                      setPhoneInput(settings.phoneNumber);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="setting-item">
                <label>Phone:</label>
                <input type="tel" value={settings.phoneNumber} readOnly />
                <button className="btn-small" onClick={() => setEditingPhone(true)}>
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="settings-card">
            <h3>Password</h3>
            <button className="btn-submit" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Change Password</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowPasswordModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Current Password:</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password:</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button className="btn-submit" onClick={handlePasswordChange}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || !studentProfile) {
    return (
      <div className="student-dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <h1>Placement Portal</h1>
              <p className="welcome-text">Welcome back, {studentProfile.name}!</p>
            </div>
          </div>
          <div className="navbar-actions">
            <span className="user-name">👤 {studentProfile.name}</span>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-content">
            <button className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>📊 Dashboard</button>
            <button className={`nav-item ${activeSection === "profile" ? "active" : ""}`} onClick={() => setActiveSection("profile")}>👤 Profile</button>
            <button className={`nav-item ${activeSection === "resume" ? "active" : ""}`} onClick={() => setActiveSection("resume")}>📄 Resume</button>
            <button className={`nav-item ${activeSection === "jobs" ? "active" : ""}`} onClick={() => setActiveSection("jobs")}>💼 Jobs</button>
            <button className={`nav-item ${activeSection === "applications" ? "active" : ""}`} onClick={() => setActiveSection("applications")}>📋 Applications</button>
            <button className={`nav-item ${activeSection === "interviews" ? "active" : ""}`} onClick={() => setActiveSection("interviews")}>📅 Interviews</button>
            <button className={`nav-item ${activeSection === "companies" ? "active" : ""}`} onClick={() => setActiveSection("companies")}>🏢 Companies</button>
            <button className={`nav-item ${activeSection === "notifications" ? "active" : ""}`} onClick={() => setActiveSection("notifications")}>🔔 Notifications</button>
            <button className={`nav-item ${activeSection === "settings" ? "active" : ""}`} onClick={() => setActiveSection("settings")}>⚙️ Settings</button>
            <button className="nav-item logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        <main className="main-content">
          {activeSection === "dashboard" && <DashboardOverview />}
          {activeSection === "profile" && <ProfileSection />}
          {activeSection === "resume" && <ResumeSection />}
          {activeSection === "jobs" && <JobsSection />}
          {activeSection === "applications" && <ApplicationsSection />}
          {activeSection === "interviews" && <InterviewsSection />}
          {activeSection === "companies" && <CompaniesSection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
