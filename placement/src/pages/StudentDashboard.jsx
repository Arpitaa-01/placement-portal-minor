import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import "../styles/StudentDashboard.css";

import DashboardOverview from "../components/student/DashboardOverview";
import ProfileSection from "../components/student/ProfileSection";
import JobsSection from "../components/student/JobsSection";
import ApplicationsSection from "../components/student/ApplicationsSection";
import JobDescModal from "../components/common/JobDescModal";

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [studentProfile, setStudentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

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
        try {
          const studentsResponse = await api.get('/students');
          const students = studentsResponse.data;
          const currentStudent = students.find(
            s => (s.email || "").trim().toLowerCase() === (userData.email || "").trim().toLowerCase()
          );
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
            const fullProfile = { ...profile, profileCompletion: computeProfileCompletion(profile) };
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
              if (res.data && res.data.id) newId = res.data.id;
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
            const fullProfile = { ...profile, profileCompletion: computeProfileCompletion(profile) };
            setStudentProfile(fullProfile);
            setProfileForm(fullProfile);
          }
        } catch (error) {
          console.error('Error fetching student profile:', error);
          setStudentProfile({
            name: userData.name || "Student",
            email: userData.email || "",
            phone: userData.phone || "",
            course: userData.course || "MCA",
            cgpa: userData.cgpa || 0,
            skills: Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills || "",
            profileCompletion: userData.profileCompletion || 0,
            profileVerified: userData.profileVerified || false,
          });
        }
      } else {
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
      cleanValue = value.replace(/\D/g, "");
      if (name === "phone") cleanValue = cleanValue.slice(0, 10);
    } else if (name === "name") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "course") {
      cleanValue = value.replace(/[^a-zA-Z\s.-]/g, "");
    } else if (name === "cgpa") {
      cleanValue = value.replace(/[^0-9.]/g, "");
      const dots = cleanValue.split(".").length - 1;
      if (dots > 1) {
        const parts = cleanValue.split(".");
        cleanValue = parts[0] + "." + parts.slice(1).join("");
      }
    } else if (name === "skills") {
      cleanValue = value.replace(/[^a-zA-Z0-9\s,+#-]/g, "");
    }
    setProfileForm((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

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

    const updatedProfile = { ...profileForm, profileCompletion: computeProfileCompletion(profileForm) };

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
        if (res.data && res.data.id) updatedProfile.id = res.data.id;
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

  const handleLogout = () => {
    localStorage.clear();
    setStudentProfile(null);
    navigate("/");
  };

  const handleApplyJob = async (job) => {
    if (!studentProfile) return;
    const studentId = studentProfile.id || 0;
    const studentName = studentProfile.name || "Student";
    const studentEmail = studentProfile.email || "";

    if (job.cgpa) {
      const requiredCgpa = parseFloat(job.cgpa);
      const studentCgpa = parseFloat(studentProfile.cgpa);
      if (!isNaN(requiredCgpa) && !isNaN(studentCgpa) && studentCgpa < requiredCgpa) {
        toast.error(`Your CGPA (${studentCgpa}) is below the required CGPA of ${requiredCgpa}.`);
        return;
      }
    }

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
        company: job.company,
      });
      toast.success(res.data.message || `Successfully applied for ${job.title || job.role}!`);
      const appliedDetailsRes = await api.get(`/jobs/applications/user-details/${studentId}?email=${encodeURIComponent(studentEmail)}`);
      if (Array.isArray(appliedDetailsRes.data)) setAppliedJobsList(appliedDetailsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply for job.");
    }
  };

  const handleRevokeApplication = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await api.delete(`/jobs/applications/${applicationId}`);
      toast.success(res.data.message || 'Application revoked successfully');
      const studentId = studentProfile.id || 0;
      const email = studentProfile.email || '';
      const appliedDetailsRes = await api.get(`/jobs/applications/user-details/${studentId}?email=${encodeURIComponent(email)}`);
      if (Array.isArray(appliedDetailsRes.data)) setAppliedJobsList(appliedDetailsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke application.');
    }
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
          {activeSection === "dashboard" && (
            <DashboardOverview
              allJobsList={allJobsList}
              appliedJobsList={appliedJobsList}
              studentProfile={studentProfile}
              setActiveSection={setActiveSection}
              setViewingJobDesc={setViewingJobDesc}
              handleApplyJob={handleApplyJob}
            />
          )}
          {activeSection === "profile" && (
            <ProfileSection
              studentProfile={studentProfile}
              profileForm={profileForm}
              isEditingProfile={isEditingProfile}
              successMessage={successMessage}
              handleProfileInputChange={handleProfileInputChange}
              handleSaveProfile={handleSaveProfile}
              handleStartEditingProfile={handleStartEditingProfile}
              handleCancelProfileEdit={handleCancelProfileEdit}
            />
          )}
          {activeSection === "jobs" && (
            <JobsSection
              allJobsList={allJobsList}
              appliedJobsList={appliedJobsList}
              jobsSubTab={jobsSubTab}
              setJobsSubTab={setJobsSubTab}
              setViewingJobDesc={setViewingJobDesc}
              handleApplyJob={handleApplyJob}
              handleRevokeApplication={handleRevokeApplication}
            />
          )}
          {activeSection === "applications" && (
            <ApplicationsSection
              appliedJobsList={appliedJobsList}
              setActiveSection={setActiveSection}
              setJobsSubTab={setJobsSubTab}
              handleRevokeApplication={handleRevokeApplication}
            />
          )}
        </main>
      </div>

      {viewingJobDesc && (
        <JobDescModal job={viewingJobDesc} onClose={() => setViewingJobDesc(null)} />
      )}
    </div>
  );
}

export default StudentDashboard;
