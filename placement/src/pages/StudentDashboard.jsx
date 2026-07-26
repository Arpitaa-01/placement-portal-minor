import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { FileText } from "lucide-react";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load user data from localStorage
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [allJobsList, setAllJobsList] = useState([]);
  const [appliedJobsList, setAppliedJobsList] = useState([]);
  const [jobsSubTab, setJobsSubTab] = useState("available");
  const [viewingJobDesc, setViewingJobDesc] = useState(null);

  const computeProfileCompletion = (profile) => {
    if (!profile) return 0;
    const completedFields = [
      !!(profile.name && profile.name.trim()),
      !!(profile.email && profile.email.trim()),
      !!(profile.enrollment && profile.enrollment.trim()),
      !!(profile.course && profile.course.trim()),
      !!(profile.batchYear && profile.batchYear.trim()),
      !!(profile.resume && profile.resume.trim()),
      !!(profile.phone && profile.phone.trim()),
      Number(profile.cgpa) > 0,
    ].filter(Boolean).length;
    return Math.round((completedFields / 8) * 100);
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
          // Find the student by email (case-insensitive)
          const currentStudent = students.find(s => (s.email || "").trim().toLowerCase() === (userData.email || "").trim().toLowerCase());
          if (currentStudent) {
            const profile = {
              id: currentStudent.id,
              name: currentStudent.name || userData.name || "",
              email: currentStudent.email || userData.email || "",
              enrollment: currentStudent.enrollment || userData.enrollment || "",
              course: currentStudent.course || userData.course || "",
              batchYear: currentStudent.batchYear || userData.batchYear || "",
              cgpa: currentStudent.cgpa || 0,
              resume: currentStudent.resume || userData.resume || "",
              profileVerified: currentStudent.profileVerified || false,
              skills: currentStudent.skills || (Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || ""),
              phone: currentStudent.phone || userData.phone || "",
            };
            const fullProfile = {
              ...profile,
              profileCompletion: computeProfileCompletion(profile),
            };
            setStudentProfile(fullProfile);
            setProfileForm(fullProfile);
          } else {
            // Dynamically create student record in DB so they have a unique ID
            let newId = null;
            try {
              const res = await api.post('/students', {
                name: userData.name || "Student",
                email: userData.email || "",
                year: userData.batchYear || "2024",
                cgpa: userData.cgpa || 0,
                resume: userData.resume || "",
                registrationStatus: "pending",
                applicationStatus: "Applied",
                enrollment: userData.enrollment || "",
                course: userData.course || "MCA",
                batchYear: userData.batchYear || "2024",
                phone: userData.phone || "",
                skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
              });
              if (res.data && res.data.id) {
                newId = res.data.id;
              }
            } catch (err) {
              console.warn("Failed to dynamically register student profile on mount:", err);
            }

            const profile = {
              id: newId,
              name: userData.name || "",
              email: userData.email || "",
              enrollment: userData.enrollment || "",
              course: userData.course || "",
              batchYear: userData.batchYear || "",
              cgpa: userData.cgpa || 0,
              resume: userData.resume || "",
              profileVerified: userData.profileVerified || false,
              skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
              phone: userData.phone || "",
            };
            const fullProfile = {
              ...profile,
              profileCompletion: computeProfileCompletion(profile),
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
            skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
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

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      if (!studentProfile) return;
      const studentId = studentProfile.id || 0;
      const email = studentProfile.email || "";

      try {
        const [jobsRes, appliedDetailsRes] = await Promise.allSettled([
          api.get('/jobs'),
          api.get(`/jobs/applications/user-details/${studentId}?email=${encodeURIComponent(email)}`)
        ]);

        if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
          setAllJobsList(jobsRes.value.data);
        }

        if (appliedDetailsRes.status === "fulfilled" && Array.isArray(appliedDetailsRes.value.data)) {
          setAppliedJobsList(appliedDetailsRes.value.data);
        }
      } catch (err) {
        console.error("Error fetching jobs data for student:", err);
      }
    };

    fetchJobsAndApplications();
  }, [studentProfile]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "phone" || name === "enrollment" || name === "batchYear") {
      // Only allow numbers
      cleanValue = value.replace(/\D/g, "");
      if (name === "phone") {
        cleanValue = cleanValue.slice(0, 10);
      }
    } else if (name === "name") {
      // Only allow letters and spaces
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "course") {
      // Only allow letters, spaces, dots, and hyphens (e.g. B.Tech, M.C.A.)
      cleanValue = value.replace(/[^a-zA-Z\s.-]/g, "");
    } else if (name === "cgpa") {
      // Allow only float number characters (digits and at most one decimal point)
      cleanValue = value.replace(/[^0-9.]/g, "");
      const dots = cleanValue.split(".").length - 1;
      if (dots > 1) {
        // Keep only first dot
        const parts = cleanValue.split(".");
        cleanValue = parts[0] + "." + parts.slice(1).join("");
      }
    } else if (name === "skills") {
      // Allow letters, digits, spaces, commas, pluses, hashes, and hyphens (e.g. C++, C#, React)
      cleanValue = value.replace(/[^a-zA-Z0-9\s,+#-]/g, "");
    }

    setProfileForm((prev) => ({
      ...prev,
      [name]: cleanValue,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validation Checks
    if (!profileForm.name || !profileForm.name.trim()) {
      toast.error("Name is required and must be a valid string.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileForm.email || !emailRegex.test(profileForm.email)) {
      toast.error("A valid email address is required.");
      return;
    }

    if (profileForm.phone && profileForm.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    if (profileForm.enrollment && profileForm.enrollment.length < 4) {
      toast.error("Enrollment number must be at least 4 digits.");
      return;
    }

    if (profileForm.course && !profileForm.course.trim()) {
      toast.error("Course must be a valid string.");
      return;
    }

    if (profileForm.batchYear) {
      const yearVal = parseInt(profileForm.batchYear, 10);
      if (isNaN(yearVal) || yearVal < 1900 || yearVal > 2100) {
        toast.error("Batch Year must be a valid 4-digit year (number between 1900 and 2100).");
        return;
      }
    }

    if (profileForm.cgpa) {
      const cgpaVal = parseFloat(profileForm.cgpa);
      if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
        toast.error("CGPA must be a valid number between 0.0 and 10.0.");
        return;
      }
    }

    const updatedProfile = {
      ...profileForm,
      profileCompletion: computeProfileCompletion(profileForm),
    };

    if (studentProfile?.id) {
      try {
        await api.put(`/students/${studentProfile.id}`, {
          name: profileForm.name || "",
          year: profileForm.batchYear || "",
          cgpa: profileForm.cgpa || "0",
          resume: profileForm.resume || "",
          enrollment: profileForm.enrollment || "",
          course: profileForm.course || "",
          batchYear: profileForm.batchYear || "",
          phone: profileForm.phone || "",
          registrationStatus: studentProfile.registrationStatus || "pending",
          applicationStatus: studentProfile.applicationStatus || "Applied",
          skills: profileForm.skills || "",
        });
        toast.success("Profile saved successfully to database!");
      } catch (error) {
        console.warn("Unable to save profile to API, saving locally instead.", error);
        toast.error("Profile saved locally, but database sync failed.");
      }
    } else {
      try {
        const res = await api.post('/students', {
          name: profileForm.name || "",
          email: profileForm.email || "",
          year: profileForm.batchYear || "",
          cgpa: profileForm.cgpa || "0",
          resume: profileForm.resume || "",
          enrollment: profileForm.enrollment || "",
          course: profileForm.course || "",
          batchYear: profileForm.batchYear || "",
          phone: profileForm.phone || "",
          registrationStatus: "pending",
          applicationStatus: "Applied",
          skills: profileForm.skills || "",
        });
        if (res.data && res.data.id) {
          updatedProfile.id = res.data.id;
        }
        toast.success("Profile created and saved successfully to database!");
      } catch (error) {
        console.warn("Unable to create profile via API", error);
        toast.error("Profile saved locally, database registration failed.");
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
    toast.success("Profile saved successfully.");
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

  const [resumeFiles, setResumeFiles] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [previewResume, setPreviewResume] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [appliedJobs, setAppliedJobs] = useState([]);


  const [allJobs] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");

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
    localStorage.clear()
    setStudentProfile(null);
    navigate("/");
  };

  const handleApplyJob = async (job) => {
    if (!studentProfile) return;
    const studentId = studentProfile.id || 0;
    const studentName = studentProfile.name || "Student";
    const studentEmail = studentProfile.email || "";

    // Eligibility check for CGPA
    if (job.cgpa) {
      const requiredCgpa = parseFloat(job.cgpa);
      const studentCgpa = parseFloat(studentProfile.cgpa);
      if (!isNaN(requiredCgpa) && !isNaN(studentCgpa) && studentCgpa < requiredCgpa) {
        toast.error(`Your CGPA (${studentCgpa}) is below the required CGPA of ${requiredCgpa}.`);
        return;
      }
    }

    // Eligibility check for Batch
    if (job.eligible_batch) {
      const studentBatch = String(studentProfile.batchYear || "").trim().toLowerCase();
      if (studentBatch) {
        const eligibleBatches = job.eligible_batch.split(",").map(b => b.trim().toLowerCase());
        const isBatchEligible = eligibleBatches.some(b => studentBatch.includes(b) || b.includes(studentBatch));
        if (!isBatchEligible) {
          toast.error(`Your batch (${studentProfile.batchYear}) is not eligible. (Required: ${job.eligible_batch})`);
          return;
        }
      }
    }

    try {
      const res = await api.post(`/jobs/${job.id}/apply`, {
        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,
        job_title: job.title || job.role,
        company: job.company
      });

      toast.success(res.data.message || `Successfully applied for ${job.title || job.role}!`);

      const appliedDetailsRes = await api.get(`/jobs/applications/user-details/${studentId}?email=${encodeURIComponent(studentEmail)}`);
      if (Array.isArray(appliedDetailsRes.data)) {
        setAppliedJobsList(appliedDetailsRes.data);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to apply for job.";
      toast.error(errMsg);
    }
  };

  // Revoke a job application
  const handleRevokeApplication = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await api.delete(`/jobs/applications/${applicationId}`);
      toast.success(res.data.message || 'Application revoked successfully');
      // Refresh applied jobs list
      const studentId = studentProfile.id || 0;
      const email = studentProfile.email || '';
      const appliedDetailsRes = await api.get(`/jobs/applications/user-details/${studentId}?email=${encodeURIComponent(email)}`);
      if (Array.isArray(appliedDetailsRes.data)) {
        setAppliedJobsList(appliedDetailsRes.data);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to revoke application.';
      toast.error(errMsg);
    }
  };

  // Dashboard Overview
  const DashboardOverview = () => {
    const totalJobsCount = (allJobsList && allJobsList.length > 0) ? allJobsList.length : (allJobs ? allJobs.length : 0);
    const jobsAppliedCount = (appliedJobsList && appliedJobsList.length > 0) ? appliedJobsList.length : (appliedJobs ? appliedJobs.length : 0);

    const stats = [
      { icon: "📄", label: "Total Jobs Available", value: totalJobsCount },
      { icon: "📝", label: "Jobs Applied", value: jobsAppliedCount },
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
        {RenderRecommendedJobs()}
      </div>
    );
  };

  // Profile Section
  const ProfileSection = () => {
    return (
      <div className="section-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👤 {studentProfile.name}'s Profile</h2>
          {!isEditingProfile && (
            <button
              className="btn-submit"
              onClick={handleStartEditingProfile}
              style={{ padding: '10px 22px', fontSize: '0.95rem' }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Profile Completion Bar */}
        {(() => {
          const completion = studentProfile.profileCompletion;
          return (
            <div className="profile-completion" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>Profile Completion</span>
                <span style={{ fontWeight: '700', color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#e53e3e' }}>
                  {completion}%
                </span>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-fill"
                  style={{
                    width: `${completion}%`,
                    background: completion >= 80
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : completion >= 50
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #e53e3e, #c53030)',
                    transition: 'width 0.6s ease'
                  }}
                ></div>
              </div>
              {completion < 80 && (
                <p className="completion-alert" style={{ marginTop: '8px' }}>
                  {completion < 50
                    ? 'Your profile is incomplete. Fill in your details to get noticed by recruiters!'
                    : 'Almost there! A few more details will complete your profile.'}
                </p>
              )}
              {studentProfile.profileVerified && (
                <p className="verified-badge" style={{ marginTop: '8px' }}>✓ Profile Verified by Admin</p>
              )}
            </div>
          );
        })()}

        {successMessage && <div className="success-message">✓ {successMessage}</div>}

        {isEditingProfile ? (
          <div className="profile-edit-form">
            <h3 style={{ marginBottom: '20px', color: '#334155', fontSize: '1.1rem' }}>Edit Your Profile</h3>
            {/* Personal Info */}
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={profileForm.name || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={profileForm.email || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={profileForm.phone || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="form-group">
                <label>Enrollment Number</label>
                <input
                  type="text"
                  name="enrollment"
                  placeholder="e.g. MCA2024001"
                  value={profileForm.enrollment || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            {/* Academic Info */}
            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <input
                  type="text"
                  name="course"
                  placeholder="e.g. MCA, BCA, B.Tech"
                  value={profileForm.course || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="form-group">
                <label>Batch Year (YYYY)</label>
                <input
                  type="text"
                  name="batchYear"
                  placeholder="e.g. 2024"
                  value={profileForm.batchYear || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  placeholder="e.g. 8.5"
                  value={profileForm.cgpa || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
              <div className="form-group">
                <label>Resume URL / Filename</label>
                <input
                  type="text"
                  name="resume"
                  placeholder="e.g. Resume_2024.pdf or a URL"
                  value={profileForm.resume || ''}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Skills (comma separated values)</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. Java, React, SQL"
                value={profileForm.skills || ""}
                onChange={handleProfileInputChange}
              />
            </div>
            <div className="button-row" style={{ marginTop: '20px' }}>
              <button className="btn-submit" onClick={handleSaveProfile}>💾 Save Profile</button>
              <button className="btn-cancel" onClick={handleCancelProfileEdit} type="button">✕ Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-grid">
            <div className="profile-card">
              <h3>Personal Details</h3>
              <div className="profile-field"><label>Name:</label><p>{studentProfile.name || '—'}</p></div>
              <div className="profile-field"><label>Email:</label><p>{studentProfile.email || '—'}</p></div>
              <div className="profile-field"><label>Phone:</label><p>{studentProfile.phone || 'Not set'}</p></div>
              <div className="profile-field"><label>Enrollment:</label><p>{studentProfile.enrollment || 'Not set'}</p></div>
            </div>
            <div className="profile-card">
              <h3>Academic Details</h3>
              <div className="profile-field"><label>Course:</label><p>{studentProfile.course || 'Not set'}</p></div>
              <div className="profile-field"><label>Batch Year:</label><p>{studentProfile.batchYear || 'Not set'}</p></div>
              <div className="profile-field"><label>CGPA:</label><p>{studentProfile.cgpa || '—'}</p></div>
            </div>
            <div className="profile-card">
              <h3>Resume</h3>
              <div className="profile-field"><label>Resume:</label><p style={{ wordBreak: 'break-all' }}>{studentProfile.resume || 'No resume set'}</p></div>
            </div>
            <div className="profile-card">
              <h3>Skills</h3>
              <div className="profile-field">
                {studentProfile.skills && studentProfile.skills.trim() !== "" ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {studentProfile.skills.split(",").map((skill, index) => (
                      <span key={index} className="job-skill-tag">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No skills added yet.</p>
                )}
              </div>
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
    const displayJobs = allJobsList.length > 0 ? allJobsList : allJobs;

    return (
      <div className="section-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2>💼 Jobs</h2>
          <div className="sub-tabs" style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn-subtab ${jobsSubTab === "available" ? "active" : ""}`}
              onClick={() => setJobsSubTab("available")}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: jobsSubTab === "available" ? '#667eea' : 'white',
                color: jobsSubTab === "available" ? 'white' : '#667eea',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: jobsSubTab === "available" ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              🏢 All Job Openings ({displayJobs.length})
            </button>
            <button
              className={`btn-subtab ${jobsSubTab === "applied" ? "active" : ""}`}
              onClick={() => setJobsSubTab("applied")}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: jobsSubTab === "applied" ? '#667eea' : 'white',
                color: jobsSubTab === "applied" ? 'white' : '#667eea',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: jobsSubTab === "applied" ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              📋 My Applied Jobs ({appliedJobsList.length})
            </button>
          </div>
        </div>

        {jobsSubTab === "available" ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Available Job Openings</h3>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Click <strong>Apply Now</strong> below to submit your application instantly!</span>
            </div>

            <div className="jobs-grid" style={{ marginTop: '15px' }}>
              {displayJobs.map((job) => {
                const isApplied = appliedJobsList.some(app => Number(app.job_id) === Number(job.id));
                return (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.company}</h3>
                      <p className="job-role">{job.title || job.role}</p>
                    </div>
                    <div className="job-details">
                      <p><strong>Salary:</strong> {job.salary} LPA</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      {job.experience && <p><strong>Experience:</strong> {job.experience}</p>}
                      <p><strong>Deadline:</strong> {job.deadline}</p>
                    </div>
                    <div className="job-criteria-list">
                      <div className="job-criteria-item">
                        <span className="criteria-label">Batch:</span>
                        <span className="criteria-value">{job.eligible_batch || "-"}</span>
                      </div>
                      <div className="job-criteria-item">
                        <span className="criteria-label">Min CGPA:</span>
                        <span className="criteria-value">{job.cgpa || "-"}</span>
                      </div>
                    </div>
                    {job.skills && job.skills.trim() !== "" ? (
                      <div className="job-skills-container" style={{ display: "flex", alignItems: "center" }}>
                        <span className="criteria-label" style={{ fontSize: "0.85rem", marginRight: "4px" }}>Skills:</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {job.skills.split(",").map((skill, index) => (
                            <span key={index} className="job-skill-tag">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="job-skills-container">
                        <span className="criteria-label" style={{ fontSize: "0.85rem" }}>Skills:</span>
                        <span className="criteria-value" style={{ fontSize: "0.85rem", marginLeft: "6px" }}>-</span>
                      </div>
                    )}
                    <div className="job-description-box" title={job.description || "No description provided"} style={{ marginTop: '8px' }}>
                      <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{job.description || "No description provided."}</span>
                    </div>
                    {job.description && (
                      <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '8px' }}>
                        <button
                          onClick={() => setViewingJobDesc(job)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4f46e5',
                            padding: 0,
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          view more
                        </button>
                      </div>
                    )}
                    <div className="job-actions">
                      {isApplied ? (
                        <button className="btn-apply btn-applied" disabled style={{ background: '#10b981', color: 'white' }}>
                          ✓ Applied
                        </button>
                      ) : (
                        <button
                          className="btn-apply"
                          onClick={() => handleApplyJob(job)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #764ba2 100%)',
                            color: '#ffffff',
                            padding: '12px 20px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          🚀 Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <h3>My Applied Jobs ({appliedJobsList.length})</h3>
            </div>
            {appliedJobsList.length === 0 ? (
              <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '12px', textAlign: 'center', marginTop: '15px' }}>
                <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>You haven't applied for any jobs yet.</p>
                <button
                  onClick={() => setJobsSubTab("available")}
                  style={{ marginTop: '15px', background: '#667eea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Browse Job Openings →
                </button>
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '15px' }}>
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role / Title</th>
                      <th>Applied Date</th>
                      <th>Salary</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedJobsList.map((item) => (
                      <tr key={item.application_id || item.job_id}>
                        <td><strong>{item.company}</strong></td>
                        <td>{item.job_title || item.role}</td>
                        <td>{item.applied_at ? new Date(item.applied_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "Recently"}</td>
                        <td>{item.salary || "N/A"}</td>
                        <td>{item.location || "N/A"}</td>
                        <td>
                          <span className={`status-badge status-${(item.status || "Applied").replace(/\s+/g, "-").toLowerCase()}`}>
                            {item.status || "Applied"}
                          </span>
                        </td>
                        <td>
                          {item.application_id && (
                            <button className="btn-revoke" onClick={() => handleRevokeApplication(item.application_id)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Applications Section
  const ApplicationsSection = () => {
    const displayList = (appliedJobsList && appliedJobsList.length > 0) ? appliedJobsList : (appliedJobs || []);
    return (
      <div className="section-content">
        <h2>📋 My Applications</h2>
        {displayList.length === 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#334155', fontSize: '1.3rem', marginBottom: '8px', fontWeight: '700' }}>
              No Applications Yet
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '24px' }}>
              You haven't applied to any jobs yet. Browse available openings and submit your first application!
            </p>
            <button
              onClick={() => { setActiveSection('jobs'); setJobsSubTab('available'); }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)'
              }}
            >
              🏢 Browse Job Openings
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '20px' }}>
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role / Title</th>
                  <th>Applied Date</th>
                  <th>Salary</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((job, idx) => (
                  <tr key={job.application_id || job.id || idx}>
                    <td><strong>{job.company}</strong></td>
                    <td>{job.job_title || job.role}</td>
                    <td>{job.applied_at ? new Date(job.applied_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : (job.appliedDate || "Recently")}</td>
                    <td>{job.salary || "N/A"}</td>
                    <td>{job.location || "N/A"}</td>
                    <td>
                      <span className={`status-badge status-${(job.status || "Applied").replace(/\s+/g, "-").toLowerCase()}`}>
                        {job.status || "Applied"}
                      </span>
                    </td>
                    <td>
                      {job.application_id && (
                        <button
                          onClick={() => handleRevokeApplication(job.application_id)}
                          style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Recommended Jobs Section Helper
  const RenderRecommendedJobs = () => {
    const isProfileComplete = studentProfile &&
      studentProfile.batchYear && studentProfile.batchYear.trim() !== "" &&
      studentProfile.cgpa && parseFloat(studentProfile.cgpa) > 0 &&
      studentProfile.skills && studentProfile.skills.trim() !== "";

    if (!isProfileComplete) {
      return (
        <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>✨ Recommended Jobs</h3>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            marginTop: '10px'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✏️</div>
            <h3 style={{ color: '#334155', fontSize: '1.1rem', marginBottom: '6px', fontWeight: '700' }}>
              Complete Your Profile
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '16px' }}>
              Please complete all details in your profile (**Batch Year, CGPA, and Skills**) to unlock personalized job recommendations!
            </p>
            <button
              onClick={() => setActiveSection('profile')}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
              }}
            >
              Go to Profile
            </button>
          </div>
        </div>
      );
    }

    const displayJobs = allJobsList.length > 0 ? allJobsList : (allJobs || []);
    const recommendedJobs = displayJobs.filter(job => {
      // 1. Batch check
      let batchMatch = true;
      if (job.eligible_batch) {
        const studentBatch = String(studentProfile.batchYear || "").trim().toLowerCase();
        const eligibleBatches = job.eligible_batch.split(",").map(b => b.trim().toLowerCase());
        batchMatch = eligibleBatches.some(b => studentBatch.includes(b) || b.includes(studentBatch));
      }

      // 2. CGPA check
      let cgpaMatch = true;
      if (job.cgpa) {
        const studentCgpa = parseFloat(studentProfile.cgpa);
        const reqCgpa = parseFloat(job.cgpa);
        cgpaMatch = !isNaN(reqCgpa) && !isNaN(studentCgpa) && studentCgpa >= reqCgpa;
      }

      // 3. Skills check
      let skillsMatch = true;
      if (job.skills && job.skills.trim() !== "") {
        const studentSkills = studentProfile.skills.split(",").map(s => s.trim().toLowerCase());
        const jobSkills = job.skills.split(",").map(s => s.trim().toLowerCase());
        skillsMatch = jobSkills.some(js => studentSkills.some(ss => ss.includes(js) || js.includes(ss)));
      }

      return batchMatch && cgpaMatch && skillsMatch;
    });

    return (
      <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>✨ Recommended Jobs</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Based on Batch (**{studentProfile.batchYear}**), CGPA (**{studentProfile.cgpa}**), and Skills (**{studentProfile.skills}**)
          </span>
        </div>

        {recommendedJobs.length === 0 ? (
          <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '12px', textAlign: 'center', marginTop: '15px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>No jobs based on your profile</p>
          </div>
        ) : (
          <div className="jobs-grid" style={{ marginTop: '15px' }}>
            {recommendedJobs.map((job) => {
              const isApplied = appliedJobsList.some(app => Number(app.job_id) === Number(job.id));
              return (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h3>{job.company}</h3>
                    <p className="job-role">{job.title || job.role}</p>
                  </div>
                  <div className="job-details">
                    <p><strong>Salary:</strong> {job.salary} LPA</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    {job.experience && <p><strong>Experience:</strong> {job.experience}</p>}
                    <p><strong>Deadline:</strong> {job.deadline}</p>
                  </div>
                  <div className="job-criteria-list">
                    <div className="job-criteria-item">
                      <span className="criteria-label">Batch:</span>
                      <span className="criteria-value">{job.eligible_batch || "-"}</span>
                    </div>
                    <div className="job-criteria-item">
                      <span className="criteria-label">Min CGPA:</span>
                      <span className="criteria-value">{job.cgpa || "-"}</span>
                    </div>
                  </div>
                  {job.skills && job.skills.trim() !== "" ? (
                    <div className="job-skills-container" style={{ display: "flex", alignItems: "center" }}>
                      <span className="criteria-label" style={{ fontSize: "0.85rem", marginRight: "4px" }}>Skills:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {job.skills.split(",").map((skill, index) => (
                          <span key={index} className="job-skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="job-skills-container">
                      <span className="criteria-label" style={{ fontSize: "0.85rem" }}>Skills:</span>
                      <span className="criteria-value" style={{ fontSize: "0.85rem", marginLeft: "6px" }}>-</span>
                    </div>
                  )}
                  <div className="job-description-box" title={job.description || "No description provided"} style={{ marginTop: '8px' }}>
                    <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{job.description || "No description provided."}</span>
                  </div>
                  {job.description && (
                    <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '8px' }}>
                      <button
                        onClick={() => setViewingJobDesc(job)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4f46e5',
                          padding: 0,
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        view more
                      </button>
                    </div>
                  )}
                  <div className="job-actions">
                    {isApplied ? (
                      <button className="btn-apply btn-applied" disabled style={{ background: '#10b981', color: 'white' }}>
                        ✓ Applied
                      </button>
                    ) : (
                      <button
                        className="btn-apply"
                        onClick={() => handleApplyJob(job)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #4f46e5 0%, #764ba2 100%)',
                          color: '#ffffff',
                          padding: '12px 20px',
                          fontSize: '1rem',
                          fontWeight: '700',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        🚀 Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
      <nav className="student-navbar">
        <div className="student-navbar-container">
          <div className="student-navbar-brand">
            <button className="student-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div>
              <h1>Placement Portal</h1>
              <p className="student-welcome-text">Welcome back, {studentProfile.name}!</p>
            </div>
          </div>
          <div className="student-navbar-actions">
            <span className="student-user-name">👤 {studentProfile.name}</span>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-content">
            <button className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>📊 Dashboard</button>
            <button className={`nav-item ${activeSection === "profile" ? "active" : ""}`} onClick={() => setActiveSection("profile")}>👤 Profile</button>
            <button className={`nav-item ${activeSection === "jobs" ? "active" : ""}`} onClick={() => setActiveSection("jobs")}>💼 Jobs</button>
            <button className={`nav-item ${activeSection === "applications" ? "active" : ""}`} onClick={() => setActiveSection("applications")}>📋 Applications</button>
            <button className="nav-item logout-btn" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        <main className="main-content">
          {activeSection === "dashboard" && DashboardOverview()}
          {activeSection === "profile" && ProfileSection()}
          {activeSection === "jobs" && JobsSection()}
          {activeSection === "applications" && ApplicationsSection()}
        </main>
      </div>

      {/* Modal for viewing full job description */}
      {viewingJobDesc && (
        <div className="modal-overlay" onClick={() => setViewingJobDesc(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Description - {viewingJobDesc.company}</h2>
              <button className="modal-close" onClick={() => setViewingJobDesc(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', padding: '24px 36px' }}>
              <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px', color: '#1e293b' }}>
                {viewingJobDesc.title}
              </div>
              <p>{viewingJobDesc.description || "No description provided."}</p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
              <button
                onClick={() => setViewingJobDesc(null)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
