import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, ChevronDown, LogOut } from "lucide-react";
import api from "../api";
import "../styles/AdminDashboard.css";

import OverviewTab from "../components/admin/OverviewTab";
import CompaniesTab from "../components/admin/CompaniesTab";
import JobsTab from "../components/admin/JobsTab";
import StudentsTab from "../components/admin/StudentsTab";
import CompanyModal from "../components/admin/Modals/CompanyModal";
import JobModal from "../components/admin/Modals/JobModal";
import ProfileModal from "../components/admin/Modals/ProfileModal";
import JobDescModal from "../components/common/JobDescModal";

function AdminDashboard() {
  const navigate = useNavigate();

  // Logged-in user information
  const [userName, setUserName] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed.name || parsed.email || "Admin";
      }
    } catch (e) {
      console.error(e);
    }
    return "Admin";
  });

  // User Profile Form State & Dropdown
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, jobsRes, studentsRes] = await Promise.all([
          api.get('/companies'),
          api.get('/jobs'),
          api.get('/students')
        ]);

        setCompanies(companiesRes.data);
        setJobs(jobsRes.data);
        setStudents(studentsRes.data);
        // Update stats based on fetched data
        const pendingApplicationsCount = studentsRes.data.filter((s) => s.applicationStatus?.toLowerCase() === "applied").length;
        setStats(prevStats => prevStats.map(stat => {
          if (stat.label === "Total Companies") return { ...stat, value: companiesRes.data.length };
          if (stat.label === "Total Job Posts") return { ...stat, value: jobsRes.data.length };
          if (stat.label === "Total Students Registered") return { ...stat, value: studentsRes.data.length };
          if (stat.label === "Pending Applications") return { ...stat, value: pendingApplicationsCount };
          return stat;
        }));
      } catch (error) {
        console.error('Error fetching data from API:', error);
        setCompanies([]);
        setJobs([]);
        setStudents([]);
        setStats(prevStats => prevStats.map(stat => {
          if (stat.label === "Total Companies") return { ...stat, value: 0 };
          if (stat.label === "Total Job Posts") return { ...stat, value: 0 };
          if (stat.label === "Total Students Registered") return { ...stat, value: 0 };
          if (stat.label === "Pending Applications") return { ...stat, value: 0 };
          return stat;
        }));
      }
    };
    fetchData();
  }, []);

  // State for stats
  const [stats, setStats] = useState([
    { icon: "👨‍🎓", label: "Total Students Registered", value: 0, color: "#4f46e5" },
    { icon: "🏢", label: "Total Companies", value: 0, color: "#0f766e" },
    { icon: "📄", label: "Total Job Posts", value: 0, color: "#dc2626" },
  ]);

  // State for companies and jobs
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Active modal state ('company' | 'job' | 'student' | null)
  const [activeModal, setActiveModal] = useState(null);

  // Company search state
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  // Filter companies by name or location
  const filteredCompanies = companies.filter((company) => {
    if (!companySearchQuery.trim()) return true;
    const query = companySearchQuery.toLowerCase().trim();
    const nameMatch = company.name ? company.name.toLowerCase().includes(query) : false;
    const locationMatch = company.location ? company.location.toLowerCase().includes(query) : false;
    return nameMatch || locationMatch;
  });

  // Job search state
  const [jobSearchQuery, setJobSearchQuery] = useState("");

  // Filter jobs by title, company, or location
  const filteredJobs = jobs.filter((job) => {
    if (!jobSearchQuery.trim()) return true;
    const query = jobSearchQuery.toLowerCase().trim();
    const titleMatch = job.title ? job.title.toLowerCase().includes(query) : false;
    const companyMatch = job.company ? job.company.toLowerCase().includes(query) : false;
    const locationMatch = job.location ? job.location.toLowerCase().includes(query) : false;
    return titleMatch || companyMatch || locationMatch;
  });

  // Form states for adding/editing company
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    industry: "",
  });
  const [companyErrors, setCompanyErrors] = useState({});
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  // Validate single company form field
  const validateCompanyField = (name, value, currentForm) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (name) {
      case "name":
        if (!value.trim()) return "Company name is required";
        if (value.trim().length < 2) return "Company name must be at least 2 characters";
        return "";

      case "email":
        if (!value.trim()) return "Company email is required";
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address";
        return "";

      case "phone": {
        const cleanPhone = value.replace(/[^0-9]/g, "");
        if (!value.trim()) return "Phone number is required";
        if (cleanPhone.length < 10 || cleanPhone.length > 15) return "Please enter a valid phone number (10-15 digits)";
        return "";
      }

      case "location":
        if (!value.trim()) return "Location is required";
        return "";

      case "website": {
        if (!value || !value.trim()) return "Website URL is required";
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
        if (!urlPattern.test(value.trim())) return "Please enter a valid website URL (e.g. https://example.com)";
        return "";
      }

      default:
        return "";
    }
  };

  // Validate all company form fields
  const validateCompanyForm = (form = companyForm) => {
    const errors = {};
    const fields = ["name", "email", "phone", "location", "website"];
    fields.forEach((field) => {
      const err = validateCompanyField(field, form[field] || "", form);
      if (err) errors[field] = err;
    });
    return errors;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear()
    navigate("/");
  };

  // Form states for adding/editing job
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    salary: "",
    location: "",
    experience: "",
    description: "",
    deadline: "",
    eligible_batch: "",
    cgpa: "",
    skills: "",
  });
  const [jobErrors, setJobErrors] = useState({});
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Students state and viewing description state
  const [students, setStudents] = useState([]);
  const [viewingJobDesc, setViewingJobDesc] = useState(null);

  // Student form handlers cleared for redesign
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJobId) {
        setApplicants([]);
        return;
      }
      setLoadingApplicants(true);
      try {
        const response = await api.get(`/jobs/applications/job/${selectedJobId}`);
        setApplicants(response.data || []);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to load applicants list.");
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    };
    fetchApplicants();
  }, [selectedJobId]);

  const handleRemoveApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to remove this student's job application?")) {
      return;
    }
    try {
      await api.delete(`/jobs/applications/${applicationId}`);
      setApplicants((prev) => prev.filter((app) => app.application_id !== applicationId));
      toast.success("Job application removed successfully!");
    } catch (error) {
      console.error("Error removing application:", error);
      toast.error("Failed to remove application. Please try again.");
    }
  };

  // Open edit profile modal
  const handleOpenEditProfileModal = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setProfileForm({
          name: parsed.name || "",
          email: parsed.email || "",
          password: "",
        });
      }
    } catch (e) {
      console.error(e);
    }
    setProfileErrors({});
    setActiveModal("profile");
  };

  // Validate single profile field
  const validateProfileField = (name, value, currentForm) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    switch (name) {
      case "name":
        if (!value || !value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Full name must be at least 2 characters";
        return "";

      case "email":
        if (!value || !value.trim()) return "Email address is required";
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address";
        return "";

      case "password":
        if (value && value.trim() && value.trim().length < 6) {
          return "Password must be at least 6 characters long";
        }
        return "";

      default:
        return "";
    }
  };

  const validateProfileForm = (form = profileForm) => {
    const errors = {};
    const fields = ["name", "email"];
    fields.forEach((field) => {
      const err = validateProfileField(field, form[field] ? String(form[field]) : "", form);
      if (err) errors[field] = err;
    });
    if (form.password && form.password.trim()) {
      const passErr = validateProfileField("password", form.password, form);
      if (passErr) errors.password = passErr;
    }
    return errors;
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...profileForm, [name]: value };
    setProfileForm(updatedForm);

    const fieldError = validateProfileField(name, value, updatedForm);
    setProfileErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Update user profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});

    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      let currentUser = {};
      try {
        currentUser = userStr ? JSON.parse(userStr) : {};
      } catch (e) { }

      let userId = currentUser.id || currentUser.userId || currentUser._id;

      // Fallback: decode userId from JWT token payload if missing
      if (!userId && token) {
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const decodedJson = JSON.parse(atob(payloadBase64));
            userId = decodedJson.id || decodedJson.userId;
          }
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }

      const payload = {
        id: userId,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        ...(profileForm.password.trim() ? { password: profileForm.password.trim() } : {})
      };

      const endpoint = userId ? `/api/auth/profile/${userId}` : `/api/auth/profile`;
      const res = await api.put(endpoint, payload);

      const updatedUser = res.data?.user || {
        ...currentUser,
        id: userId,
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserName(updatedUser.name || updatedUser.email);
      toast.success("Profile updated successfully!");
      setActiveModal(null);
    } catch (error) {
      console.error("API error:", error);
      toast.error(error.response?.data?.message || "Profile update failed. Please try again.");
    }
  };

  // Student status operations cleared for redesign

  // Handle company form change with real-time field validation
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...companyForm, [name]: value };
    setCompanyForm(updatedForm);

    const fieldError = validateCompanyField(name, value, updatedForm);
    setCompanyErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Handle job form change with real-time field validation
  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...jobForm, [name]: value };
    setJobForm(updatedForm);

    const fieldError = validateJobField(name, value, updatedForm);
    setJobErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // Validate single job form field
  const validateJobField = (name, value, currentForm) => {
    switch (name) {
      case "title":
        if (!value || !value.trim()) return "Job title is required";
        if (value.trim().length < 2) return "Job title must be at least 2 characters";
        return "";

      case "company":
        if (!value || !value.trim()) return "Please select a company";
        return "";

      case "location":
        if (!value || !value.trim()) return "Job location is required";
        return "";

      case "salary":
        if (!value || !value.trim()) return "Salary package is required";
        return "";

      case "experience":
        if (value === undefined || value === null || String(value).trim() === "") return "Experience is required (enter 0 for freshers)";
        return "";

      case "deadline":
        if (!value || !value.trim()) return "Application deadline is required";
        return "";

      case "eligible_batch":
        if (!value || !value.trim()) return "Eligible batch is required";
        return "";

      case "cgpa": {
        if (value === undefined || value === null || String(value).trim() === "") return "Required CGPA is required";
        const cgpaNum = parseFloat(value);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) return "Required CGPA must be between 0.0 and 10.0";
        return "";
      }

      default:
        return "";
    }
  };

  // Validate all job form fields
  const validateJobForm = (form = jobForm) => {
    const errors = {};
    const fields = ["title", "company", "location", "salary", "experience", "deadline", "eligible_batch", "cgpa"];
    fields.forEach((field) => {
      const err = validateJobField(field, form[field] !== undefined ? String(form[field]) : "", form);
      if (err) errors[field] = err;
    });
    return errors;
  };

  // Open add company modal
  const handleOpenAddCompanyModal = () => {
    setIsEditingCompany(false);
    setEditingCompanyId(null);
    setCompanyForm({
      name: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      industry: "",
    });
    setCompanyErrors({});
    setActiveModal("company");
  };

  // Open edit company modal
  const handleEditCompany = (company) => {
    setIsEditingCompany(true);
    setEditingCompanyId(company.id);
    setCompanyForm({
      name: company.name || "",
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      location: company.location || "",
      industry: company.industry || "",
    });
    setCompanyErrors({});
    setActiveModal("company");
  };

  // Open add job modal
  const handleOpenAddJobModal = () => {
    setIsEditingJob(false);
    setEditingJobId(null);
    setJobForm({
      title: "",
      company: "",
      salary: "",
      location: "",
      experience: "",
      description: "",
      deadline: "",
      eligible_batch: "",
      cgpa: "",
      skills: "",
    });
    setJobErrors({});
    setActiveModal("job");
  };

  // Open edit job modal
  const handleEditJob = (job) => {
    setIsEditingJob(true);
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      salary: job.salary || "",
      location: job.location || "",
      experience: job.experience || "",
      description: job.description || "",
      deadline: job.deadline || "",
      eligible_batch: job.eligible_batch || "",
      cgpa: job.cgpa || "",
      skills: job.skills || "",
    });
    setJobErrors({});
    setActiveModal("job");
  };

  // Add company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    const errors = validateCompanyForm();
    if (Object.keys(errors).length > 0) {
      setCompanyErrors(errors);
      return;
    }

    setCompanyErrors({});

    let formattedWebsite = companyForm.website.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const payload = {
      ...companyForm,
      name: companyForm.name.trim(),
      email: companyForm.email.trim(),
      phone: companyForm.phone.trim(),
      location: companyForm.location.trim(),
      industry: companyForm.industry.trim(),
      website: formattedWebsite,
    };

    try {
      if (isEditingCompany) {
        const response = await api.put(`/companies/${editingCompanyId}`, payload);
        setCompanies(prev => prev.map(c => c.id === editingCompanyId ? response.data : c));
        toast.success("Company updated successfully!");
      } else {
        const response = await api.post('/companies', payload);
        const newCompany = response.data;
        setCompanies(prevCompanies => [...prevCompanies, newCompany]);
        setStats(prevStats =>
          prevStats.map((stat) =>
            stat.label === "Total Companies"
              ? { ...stat, value: stat.value + 1 }
              : stat
          )
        );
        toast.success("Company added successfully!");
      }
      setCompanyForm({
        name: "",
        email: "",
        phone: "",
        website: "",
        location: "",
        industry: "",
      });
      setIsEditingCompany(false);
      setEditingCompanyId(null);
      setActiveModal(null);
    } catch (error) {
      console.error('API error:', error);
      toast.error(isEditingCompany ? "Company update failed." : "Company add failed. Please try again.");
    }
  };

  // Add or update job
  const handleAddJob = async (e) => {
    e.preventDefault();
    const errors = validateJobForm();
    if (Object.keys(errors).length > 0) {
      setJobErrors(errors);
      return;
    }

    setJobErrors({});

    try {
      if (isEditingJob) {
        const response = await api.put(`/jobs/${editingJobId}`, jobForm);
        setJobs(prev => prev.map(j => j.id === editingJobId ? response.data : j));
        toast.success("Job post updated successfully!");
      } else {
        const response = await api.post('/jobs', jobForm);
        const newJob = response.data;
        setJobs(prevJobs => [...prevJobs, newJob]);
        setStats(prevStats =>
          prevStats.map((stat) =>
            stat.label === "Total Job Posts"
              ? { ...stat, value: stat.value + 1 }
              : stat
          )
        );
        toast.success("Job posted successfully!");
      }
      setJobForm({
        title: "",
        company: "",
        salary: "",
        location: "",
        experience: "",
        description: "",
        deadline: "",
        eligible_batch: "",
        cgpa: "",
        skills: "",
      });
      setJobErrors({});
      setIsEditingJob(false);
      setEditingJobId(null);
      setActiveModal(null);
    } catch (error) {
      console.error('API error:', error);
      toast.error(isEditingJob ? "Job post update failed." : "Job post failed. Please try again.");
    }
  };

  // Delete company
  const handleDeleteCompany = async (id) => {
    try {
      await api.delete(`/companies/${id}`);
      setCompanies(companies.filter((company) => company.id !== id));
      const updatedStats = stats.map((stat) =>
        stat.label === "Total Companies"
          ? { ...stat, value: stat.value - 1 }
          : stat
      );
      setStats(updatedStats);
      toast.success("Company deleted successfully!");
    } catch (error) {
      console.error('API error:', error);
      toast.error("Company delete failed. Please try again.");
    }
  };

  // Delete job
  const handleDeleteJob = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter((job) => job.id !== id));
      const updatedStats = stats.map((stat) =>
        stat.label === "Total Job Posts"
          ? { ...stat, value: stat.value - 1 }
          : stat
      );
      setStats(updatedStats);
      toast.success("Job deleted successfully!");
    } catch (error) {
      console.error('API error:', error);
      toast.error("Job delete failed. Please try again.");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-top">
          <div className="header-title">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, <strong>{userName}</strong>! Manage companies, jobs, and oversee placement portal statistics</p>
          </div>
          <div className="header-buttons">
            <div className="user-dropdown-container">
              <button
                className="user-avatar-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title={`Logged in as ${userName}`}
              >
                <span className="user-avatar">{userName.charAt(0).toUpperCase()}</span>
                {/* <span className="user-name-text">{userName}</span> */}
                <ChevronDown size={16} className={`dropdown-arrow ${isProfileMenuOpen ? "open" : ""}`} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <span className="dropdown-user-name">{userName}</span>
                      <span className="dropdown-user-role">Administrator</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleOpenEditProfileModal();
                      }}
                    >
                      <Pencil size={15} /> Edit Profile
                    </button>
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overview Cards Section */}
      <div className="dashboard-overview">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ "--accent": stat.color }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
              {/* <div className="stat-hover-indicator">Live Data</div> */}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
          onClick={() => setActiveTab("companies")}
        >
          Companies
        </button>
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          Job Posts
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          handleOpenAddCompanyModal={handleOpenAddCompanyModal}
          handleOpenAddJobModal={handleOpenAddJobModal}
        />
      )}

      {activeTab === "companies" && (
        <CompaniesTab
          filteredCompanies={filteredCompanies}
          companySearchQuery={companySearchQuery}
          setCompanySearchQuery={setCompanySearchQuery}
          handleOpenAddCompanyModal={handleOpenAddCompanyModal}
          handleEditCompany={handleEditCompany}
          handleDeleteCompany={handleDeleteCompany}
        />
      )}

      {activeTab === "jobs" && (
        <JobsTab
          filteredJobs={filteredJobs}
          jobSearchQuery={jobSearchQuery}
          setJobSearchQuery={setJobSearchQuery}
          handleOpenAddJobModal={handleOpenAddJobModal}
          handleEditJob={handleEditJob}
          handleDeleteJob={handleDeleteJob}
          setViewingJobDesc={setViewingJobDesc}
        />
      )}

      {activeTab === "students" && (
        <StudentsTab
          jobs={jobs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          applicants={applicants}
          loadingApplicants={loadingApplicants}
          handleRemoveApplication={handleRemoveApplication}
        />
      )}

      {/* Add Company Modal */}
      {activeModal === "company" && (
        <CompanyModal
          isEditingCompany={isEditingCompany}
          companyForm={companyForm}
          companyErrors={companyErrors}
          handleCompanyInputChange={handleCompanyInputChange}
          handleAddCompany={handleAddCompany}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Post Job Modal */}
      {activeModal === "job" && (
        <JobModal
          isEditingJob={isEditingJob}
          jobForm={jobForm}
          jobErrors={jobErrors}
          companies={companies}
          handleJobInputChange={handleJobInputChange}
          handleAddJob={handleAddJob}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Add / Edit Student Modal cleared for redesign */}

      {/* Edit User Profile Modal */}
      {activeModal === "profile" && (
        <ProfileModal
          profileForm={profileForm}
          profileErrors={profileErrors}
          handleProfileInputChange={handleProfileInputChange}
          handleUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Modal for viewing full job description */}
      {viewingJobDesc && (
        <JobDescModal job={viewingJobDesc} onClose={() => setViewingJobDesc(null)} />
      )}
    </div>
  );
}

export default AdminDashboard;
