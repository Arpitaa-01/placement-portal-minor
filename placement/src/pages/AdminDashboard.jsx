import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Mail, Phone, MapPin, Globe, ExternalLink, Building2, Briefcase, DollarSign, Clock, Calendar, FileText, Plus, X, Award, GraduationCap, Filter, Search, ChevronDown, LogOut } from "lucide-react";
import api from "../api";
import "../styles/AdminDashboard.css";

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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="tab-content">
          <div className="overview-summary-section">
            <div className="overview-welcome-card">
              <div className="welcome-text">
                <h3>⚡ Quick Admin Actions</h3>
                <p>Manage placement portal activities efficiently. Add new companies or post job openings directly.</p>
              </div>
              <div className="overview-cta-row">
                <button
                  className="btn-add-primary"
                  onClick={handleOpenAddCompanyModal}
                >
                  <Building2 size={18} /> Add New Company
                </button>
                <button
                  className="btn-add-primary btn-job-accent"
                  onClick={handleOpenAddJobModal}
                >
                  <Briefcase size={18} /> Post New Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="tab-content">
          <div className="tab-header-row">
            <h3>Registered Companies ({filteredCompanies.length})</h3>
            <button
              className="btn-add-primary"
              onClick={handleOpenAddCompanyModal}
            >
              <Plus size={18} /> Add Company
            </button>
          </div>

          {/* Company Search Bar */}
          <div className="company-search-container">
            <div className="company-search-input-wrapper">
              <Search size={18} className="company-search-icon" />
              <input
                type="text"
                placeholder="Search by company name or location..."
                value={companySearchQuery}
                onChange={(e) => setCompanySearchQuery(e.target.value)}
                className="company-search-input"
              />
              {companySearchQuery && (
                <button
                  className="company-search-clear-btn"
                  onClick={() => setCompanySearchQuery("")}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {companySearchQuery && (
              <span className="search-results-count">
                Found {filteredCompanies.length} company{filteredCompanies.length !== 1 ? "ies" : ""}
              </span>
            )}
          </div>

          {filteredCompanies.length === 0 ? (
            <p className="empty-state">
              {companySearchQuery
                ? `No companies found matching "${companySearchQuery}"`
                : "No companies added yet"}
            </p>
          ) : (
            <div className="companies-grid">
              {filteredCompanies.map((company) => {
                const initial = company.name ? company.name.charAt(0).toUpperCase() : "C";
                return (
                  <div key={company.id} className="company-card">
                    <div className="company-card-header">
                      <div className="company-avatar-wrapper">
                        <div className="company-avatar">{initial}</div>
                        <div className="company-title-info">
                          <div className="company-name-row">
                            {company.website ? (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noreferrer"
                                className="company-name-link"
                                title={`Visit ${company.name} website (${company.website})`}
                              >
                                <span className="company-name">{company.name}</span>
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
                      <div className="company-actions">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => handleEditCompany(company)}
                          title="Edit company"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => handleDeleteCompany(company.id)}
                          title="Delete company"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="company-info-list">
                      <div className="company-info-item">
                        <Mail size={16} />
                        <span title={company.email}>{company.email || "N/A"}</span>
                      </div>
                      <div className="company-info-item">
                        <Phone size={16} />
                        <span title={company.phone}>{company.phone || "N/A"}</span>
                      </div>
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
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="tab-content">
          <div className="tab-header-row">
            <h3>Active Job Posts ({filteredJobs.length})</h3>
            <button
              className="btn-add-primary btn-job-accent"
              onClick={handleOpenAddJobModal}
            >
              <Plus size={18} /> Post New Job
            </button>
          </div>

          {/* Job Search Bar */}
          <div className="company-search-container">
            <div className="company-search-input-wrapper">
              <Search size={18} className="company-search-icon" />
              <input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="company-search-input"
              />
              {jobSearchQuery && (
                <button
                  className="company-search-clear-btn"
                  onClick={() => setJobSearchQuery("")}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {jobSearchQuery && (
              <span className="search-results-count">
                Found {filteredJobs.length} job post{filteredJobs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <p className="empty-state">
              {jobSearchQuery
                ? `No job posts found matching "${jobSearchQuery}"`
                : "No jobs posted yet"}
            </p>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-avatar-wrapper">
                      <div className="job-avatar">
                        <Briefcase size={22} />
                      </div>
                      <div className="job-title-info">
                        <h4 className="job-title" title={job.title}>{job.title}</h4>
                        <span className="job-company-tag" title={job.company}>
                          {job.company || "Company N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="job-actions">
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => handleEditJob(job)}
                        title="Edit job post"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete job post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="job-info-list">
                    <div className="job-info-item">
                      <MapPin size={16} />
                      <span title={job.location}>{job.location || "Location N/A"}</span>
                    </div>
                    <div className="job-info-item">
                      <DollarSign size={16} />
                      <span title={job.salary ? `${job.salary} LPA` : "Salary N/A"}>
                        {job.salary ? `${job.salary} LPA` : "Salary N/A"}
                      </span>
                    </div>
                    <div className="job-info-item">
                      <Clock size={16} />
                      <span title={job.experience}>{`${job.experience} years` || "Freshers eligible"}</span>
                    </div>
                    <div className="job-info-item">
                      <Calendar size={16} />
                      <span title={job.deadline}>
                        {job.deadline ? `Deadline: ${job.deadline}` : "No deadline set"}
                      </span>
                    </div>
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

                  <div className="job-description-box" title={job.description || "No description provided"}>
                    <FileText size={14} />
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="tab-content">
          <div className="tab-header-row">
            <h3>Applicants By Job Post</h3>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '15px' }}>
            <div className="filter-group" style={{ maxWidth: '400px', width: '100%' }}>
              <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '8px' }}>Select Job Post *</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: '#f8fafc'
                }}
              >
                <option value="">-- Choose a Job --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.company} - {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of applicants */}
          {!selectedJobId ? (
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', marginTop: '20px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>
                Please select a job post to view applicants.
              </p>
            </div>
          ) : loadingApplicants ? (
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', marginTop: '20px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>
                Loading applicants...
              </p>
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', marginTop: '20px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>
                No applications found for this job post.
              </p>
            </div>
          ) : (
            <div className="students-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {applicants.map((app) => {
                const initial = app.student_name ? app.student_name.charAt(0).toUpperCase() : "S";
                return (
                  <div key={app.application_id} className="student-card" style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#eef2ff',
                          color: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '1.1rem'
                        }}>
                          {initial}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }} title={app.student_name}>{app.student_name || "Name N/A"}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                            Batch {app.student_year || app.batchYear || "N/A"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveApplication(app.application_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        title="Remove Job Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                      <div>📧 <strong>Email:</strong> {app.student_email}</div>
                      <div>📞 <strong>Phone:</strong> {app.phone || "N/A"}</div>
                      {app.enrollment && <div>🆔 <strong>Enrollment:</strong> {app.enrollment}</div>}
                      {app.course && <div>🎓 <strong>Course:</strong> {app.course}</div>}
                      <div>📊 <strong>CGPA:</strong> <strong style={{ color: '#0f172a' }}>{app.student_cgpa || "N/A"}</strong></div>
                    </div>

                    {app.student_skills && app.student_skills.trim() !== "" && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {app.student_skills.split(",").map((skill, idx) => (
                          <span key={idx} style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontWeight: '600'
                          }}>
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: app.application_status === 'Approved' ? '#10b981' : '#f59e0b',
                        background: app.application_status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        Status: {app.application_status || "Applied"}
                      </span>
                      {app.student_resume ? (
                        <a href={app.student_resume} target="_blank" rel="noreferrer" style={{
                          fontSize: '0.8rem',
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FileText size={12} /> View Resume
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No Resume</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Company Modal */}
      {activeModal === "company" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏢 {isEditingCompany ? "Edit Company" : "Add New Company"}</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddCompany} className="admin-form" noValidate>
                <div className="form-row">
                  <div className={`form-group ${companyErrors.name ? "has-error" : ""}`}>
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter company name"
                      value={companyForm.name}
                      onChange={handleCompanyInputChange}
                      className={companyErrors.name ? "input-error" : ""}
                    />
                    {companyErrors.name && <span className="error-text">{companyErrors.name}</span>}
                  </div>
                  <div className={`form-group ${companyErrors.website ? "has-error" : ""}`}>
                    <label>Website *</label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://example.com"
                      value={companyForm.website}
                      onChange={handleCompanyInputChange}
                      className={companyErrors.website ? "input-error" : ""}
                    />
                    {companyErrors.website && <span className="error-text">{companyErrors.website}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${companyErrors.email ? "has-error" : ""}`}>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="company@email.com"
                      value={companyForm.email}
                      onChange={handleCompanyInputChange}
                      className={companyErrors.email ? "input-error" : ""}
                    />
                    {companyErrors.email && <span className="error-text">{companyErrors.email}</span>}
                  </div>
                  <div className={`form-group ${companyErrors.phone ? "has-error" : ""}`}>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91-XXXXXXXXXX"
                      value={companyForm.phone}
                      onChange={handleCompanyInputChange}
                      className={companyErrors.phone ? "input-error" : ""}
                    />
                    {companyErrors.phone && <span className="error-text">{companyErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${companyErrors.location ? "has-error" : ""}`}>
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="City, Country"
                      value={companyForm.location}
                      onChange={handleCompanyInputChange}
                      className={companyErrors.location ? "input-error" : ""}
                    />
                    {companyErrors.location && <span className="error-text">{companyErrors.location}</span>}
                  </div>
                  <div className="form-group">
                    <label>Industry</label>
                    <input
                      type="text"
                      name="industry"
                      placeholder="e.g., IT, Finance, Healthcare"
                      value={companyForm.industry}
                      onChange={handleCompanyInputChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  {isEditingCompany ? "Update Company" : "Add Company"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {activeModal === "job" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {isEditingJob ? "Edit Job Post" : "Post New Job"}</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddJob} className="admin-form" noValidate>
                <div className="form-row">
                  <div className={`form-group ${jobErrors.title ? "has-error" : ""}`}>
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Software Engineer"
                      value={jobForm.title}
                      onChange={handleJobInputChange}
                      className={jobErrors.title ? "input-error" : ""}
                    />
                    {jobErrors.title && <span className="error-text">{jobErrors.title}</span>}
                  </div>
                  <div className={`form-group ${jobErrors.company ? "has-error" : ""}`}>
                    <label>Company *</label>
                    <select
                      name="company"
                      value={jobForm.company}
                      onChange={handleJobInputChange}
                      className={jobErrors.company ? "input-error" : ""}
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {jobErrors.company && <span className="error-text">{jobErrors.company}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${jobErrors.location ? "has-error" : ""}`}>
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Job location"
                      value={jobForm.location}
                      onChange={handleJobInputChange}
                      className={jobErrors.location ? "input-error" : ""}
                    />
                    {jobErrors.location && <span className="error-text">{jobErrors.location}</span>}
                  </div>
                  <div className={`form-group ${jobErrors.salary ? "has-error" : ""}`}>
                    <label>Salary (LPA) *</label>
                    <input
                      type="text"
                      name="salary"
                      placeholder="e.g., 5-7 LPA"
                      value={jobForm.salary}
                      onChange={handleJobInputChange}
                      className={jobErrors.salary ? "input-error" : ""}
                    />
                    {jobErrors.salary && <span className="error-text">{jobErrors.salary}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${jobErrors.experience ? "has-error" : ""}`}>
                    <label>Experience Required *</label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g., 0-1 years"
                      value={jobForm.experience}
                      onChange={handleJobInputChange}
                      className={jobErrors.experience ? "input-error" : ""}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      💡 For fresher roles, enter <strong>0</strong> years experience
                    </small>
                    {jobErrors.experience && <span className="error-text">{jobErrors.experience}</span>}
                  </div>
                  <div className={`form-group ${jobErrors.deadline ? "has-error" : ""}`}>
                    <label>Application Deadline *</label>
                    <input
                      type="date"
                      name="deadline"
                      value={jobForm.deadline}
                      onChange={handleJobInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={jobErrors.deadline ? "input-error" : ""}
                    />
                    {jobErrors.deadline && <span className="error-text">{jobErrors.deadline}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={`form-group ${jobErrors.eligible_batch ? "has-error" : ""}`}>
                    <label>Eligible Batch *</label>
                    <input
                      type="text"
                      name="eligible_batch"
                      placeholder="e.g., 2024, 2025"
                      value={jobForm.eligible_batch}
                      onChange={handleJobInputChange}
                      className={jobErrors.eligible_batch ? "input-error" : ""}
                    />
                    {jobErrors.eligible_batch && <span className="error-text">{jobErrors.eligible_batch}</span>}
                  </div>
                  <div className={`form-group ${jobErrors.cgpa ? "has-error" : ""}`}>
                    <label>Minimum CGPA *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      placeholder="e.g., 7.5"
                      value={jobForm.cgpa}
                      onChange={handleJobInputChange}
                      className={jobErrors.cgpa ? "input-error" : ""}
                    />
                    {jobErrors.cgpa && <span className="error-text">{jobErrors.cgpa}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Required Skills (comma separated values)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g., React, Node.js, SQL"
                    value={jobForm.skills}
                    onChange={handleJobInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the job responsibilities and requirements"
                    value={jobForm.description}
                    onChange={handleJobInputChange}
                    rows="2"
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit btn-job-accent">
                  {isEditingJob ? "Update Job Post" : "Post Job"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal cleared for redesign */}

      {/* Edit User Profile Modal */}
      {activeModal === "profile" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Edit User Profile</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateProfile} className="admin-form" noValidate>
                <div className={`form-group ${profileErrors.name ? "has-error" : ""}`}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    className={profileErrors.name ? "input-error" : ""}
                  />
                  {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
                </div>

                <div className={`form-group ${profileErrors.email ? "has-error" : ""}`}>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    className={profileErrors.email ? "input-error" : ""}
                  />
                  {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
                </div>

                <div className={`form-group ${profileErrors.password ? "has-error" : ""}`}>
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={profileForm.password}
                    onChange={handleProfileInputChange}
                    className={profileErrors.password ? "input-error" : ""}
                  />
                  {profileErrors.password && <span className="error-text">{profileErrors.password}</span>}
                </div>

                <button type="submit" className="btn-submit">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default AdminDashboard;
