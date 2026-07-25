import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import api from "../api";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

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
    // { icon: "✅", label: "Students Placed", value: 380, color: "#15803d" },
    // { icon: "⏳", label: "Pending Applications", value: 0, color: "#d97706" },
    // { icon: "📊", label: "Placement Percentage", value: "30.4%", color: "#7c3aed" },
    // { icon: "📅", label: "Upcoming Interviews", value: 42, color: "#be185d" },
  ]);

  // State for companies and jobs
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Form states for adding company
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    industry: "",
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Form states for adding job
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    salary: "",
    location: "",
    experience: "",
    description: "",
    deadline: "",
  });

  // Students state and management
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    year: "",
    cgpa: "",
    resume: "",
    registrationStatus: "pending",
    applicationStatus: "Applied",
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterCGPA, setFilterCGPA] = useState("");

  // Handle student form changes
  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm({ ...studentForm, [name]: value });
  };

  // Add or update student
  const handleAddOrUpdateStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email || !studentForm.year || !studentForm.cgpa) {
      toast.error("Please fill in name, email, year and CGPA");
      return;
    }

    // Check CGPA requirement for new students
    if (!isEditingStudent && parseFloat(studentForm.cgpa) <= 7.8) {
      toast.error("Only students with CGPA greater than 7.8 can register!");
      return;
    }

    const newStudent = {
      id: Date.now(),
      ...studentForm,
    };
    try {
      if (isEditingStudent) {
        const response = await api.put(`/students/${editingStudentId}`, studentForm);
        const updatedStudents = students.map((s) =>
          s.id === editingStudentId ? response.data : s
        );
        setStudents(updatedStudents);
        setIsEditingStudent(false);
        setEditingStudentId(null);
        toast.success("Student updated successfully!");
      } else {
        const response = await api.post('/students', studentForm);
        const updatedStudents = [...students, response.data];
        setStudents(updatedStudents);
        // increment stat
        const updatedStats = stats.map((stat) =>
          stat.label === "Total Students Registered"
            ? { ...stat, value: stat.value + 1 }
            : stat
        );
        setStats(updatedStats);
        toast.success("Student added successfully!");
      }
    } catch (error) {
      console.error('API error:', error);
      if (isEditingStudent) {
        setStudents(
          students.map((s) =>
            s.id === editingStudentId ? newStudent : s
          )
        );
        toast.error("Student update failed. Please try again.");
      } else {
        setStudents([...students, newStudent]);
        toast.error("Student add failed. Please try again.");
      }
    }
    setStudentForm({
      name: "",
      email: "",
      year: "",
      cgpa: "",
      resume: "",
      registrationStatus: "pending",
      applicationStatus: "Applied",
    });
    setIsEditingStudent(false);
    setEditingStudentId(null);
  };

  // Edit student
  const handleEditStudent = (student) => {
    setIsEditingStudent(true);
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name,
      email: student.email,
      year: student.year,
      cgpa: student.cgpa,
      resume: student.resume,
      registrationStatus: student.registrationStatus,
      applicationStatus: student.applicationStatus,
    });
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter((s) => s.id !== id));
      const updatedStats = stats.map((stat) =>
        stat.label === "Total Students Registered"
          ? { ...stat, value: stat.value - 1 }
          : stat
      );
      setStats(updatedStats);
      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error('API error:', error);
      toast.error("Student delete failed. Please try again.");
    }
  };

  // Approve / reject registration
  const handleApproveStudent = async (id) => {
    try {
      await api.put(`/students/${id}`, { registrationStatus: "approved" });
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, registrationStatus: "approved" } : s
        )
      );
      toast.success("Student approved!");
    } catch (error) {
      console.error('API error:', error);
      toast.error("Student approval failed. Please try again.");
    }
  };
  const handleRejectStudent = async (id) => {
    try {
      await api.put(`/students/${id}`, { registrationStatus: "rejected" });
      setStudents(
        students.map((s) =>
          s.id === id ? { ...s, registrationStatus: "rejected" } : s
        )
      );
      toast.success("Student rejected!");
    } catch (error) {
      console.error('API error:', error);
      toast.error("Student rejection failed. Please try again.");
    }
  };

  // Filtered students list
  const filteredStudents = students.filter(
    (s) =>
      (filterYear ? s.year === filterYear : true) &&
      (filterCGPA ? parseFloat(s.cgpa) >= parseFloat(filterCGPA) : true)
  );

  // Handle company form change
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm({ ...companyForm, [name]: value });
  };

  // Handle job form change
  const handleJobInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm({ ...jobForm, [name]: value });
  };

  // Add company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (
      companyForm.name &&
      companyForm.email &&
      companyForm.phone &&
      companyForm.location
    ) {
      try {
        const response = await api.post('/companies', companyForm);
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
      } catch (error) {
        console.error('API error:', error);
        toast.error("Company add failed. Please try again.");
      }
      setCompanyForm({
        name: "",
        email: "",
        phone: "",
        website: "",
        location: "",
        industry: "",
      });
    } else {
      toast.error("Please fill in all required company fields");
    }
  };

  // Add job
  const handleAddJob = async (e) => {
    e.preventDefault();
    if (
      jobForm.title &&
      jobForm.company &&
      jobForm.salary &&
      jobForm.location
    ) {
      try {
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
      } catch (error) {
        console.error('API error:', error);
        toast.error("Job post failed. Please try again.");
      }
      setJobForm({
        title: "",
        company: "",
        salary: "",
        location: "",
        experience: "",
        description: "",
        deadline: "",
      });
    } else {
      toast.error("Please fill in all required job fields");
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
            <p>Manage companies, jobs, and oversee placement portal statistics</p>
          </div>
          <div className="header-buttons">
            <button
              className="btn-home"
              onClick={() => navigate("/")}
            >
              🏠 Home
            </button>
            <button
              className="btn-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
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
          <div className="content-grid">
            {/* Add Company Section */}
            <div className="form-section">
              <h3>Add New Company</h3>
              <form onSubmit={handleAddCompany} className="admin-form">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter company name"
                    value={companyForm.name}
                    onChange={handleCompanyInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="company@email.com"
                      value={companyForm.email}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91-XXXXXXXXXX"
                      value={companyForm.phone}
                      onChange={handleCompanyInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="City, Country"
                      value={companyForm.location}
                      onChange={handleCompanyInputChange}
                      required
                    />
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

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://example.com"
                    value={companyForm.website}
                    onChange={handleCompanyInputChange}
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Add Company
                </button>
              </form>
            </div>

            {/* Add Job Section */}
            <div className="form-section">
              <h3>📋 Post New Job</h3>
              <form onSubmit={handleAddJob} className="admin-form">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Software Engineer"
                    value={jobForm.title}
                    onChange={handleJobInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Company *</label>
                    <select
                      name="company"
                      value={jobForm.company}
                      onChange={handleJobInputChange}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Job location"
                      value={jobForm.location}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Salary (LPA) *</label>
                    <input
                      type="text"
                      name="salary"
                      placeholder="e.g., 5-7 LPA"
                      value={jobForm.salary}
                      onChange={handleJobInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience Required</label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g., 0-1 years"
                      value={jobForm.experience}
                      onChange={handleJobInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe the job responsibilities and requirements"
                    value={jobForm.description}
                    onChange={handleJobInputChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={jobForm.deadline}
                    onChange={handleJobInputChange}
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Post Job
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="tab-content">
          <h3>Registered Companies ({companies.length})</h3>
          {companies.length === 0 ? (
            <p className="empty-state">No companies added yet</p>
          ) : (
            <div className="list-container">
              {companies.map((company) => (
                <div key={company.id} className="list-item">
                  <div className="item-header">
                    <h4>{company.name}</h4>
                    <span className="badge">{company.industry}</span>
                  </div>
                  <div className="item-details">
                    <p>
                      <strong>Email:</strong> {company.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {company.phone}
                    </p>
                    <p>
                      <strong>Location:</strong> {company.location}
                    </p>
                    {company.website && (
                      <p>
                        <strong>Website:</strong>{" "}
                        <a href={company.website} target="_blank" rel="noreferrer">
                          {company.website}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="student-actions">
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDeleteCompany(company.id)}
                      title="Delete company"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="tab-content">
          <h3>Active Job Posts ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <p className="empty-state">No jobs posted yet</p>
          ) : (
            <div className="list-container">
              {jobs.map((job) => (
                <div key={job.id} className="list-item">
                  <div className="item-header">
                    <h4>{job.title}</h4>
                    <span className="badge">{job.company}</span>
                  </div>
                  <div className="item-details">
                    <p>
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p>
                      <strong>Salary:</strong> {job.salary} LPA
                    </p>
                    {job.experience && (
                      <p>
                        <strong>Experience:</strong> {job.experience}
                      </p>
                    )}
                    {job.description && (
                      <p>
                        <strong>Description:</strong> {job.description}
                      </p>
                    )}
                    {job.deadline && (
                      <p>
                        <strong>Deadline:</strong> {job.deadline}
                      </p>
                    )}
                  </div>
                  <div className="student-actions">
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="tab-content">
          <h3>Student Management ({students.length})</h3>

          {/* Filters */}
          <div className="filter-section">
            <div className="filter-group">
              <label>Year:</label>
              <input
                type="text"
                placeholder="e.g., 2024"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Min CGPA:</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 7.5"
                value={filterCGPA}
                onChange={(e) => setFilterCGPA(e.target.value)}
              />
            </div>
          </div>

          {/* Add/Edit Student Form */}
          <div className="form-section">
            <h3>{isEditingStudent ? "✏️ Edit Student" : "Add New Student"}</h3>
            <form onSubmit={handleAddOrUpdateStudent} className="admin-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={studentForm.name}
                  onChange={handleStudentInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@gmail.com"
                  value={studentForm.email}
                  onChange={handleStudentInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="text"
                    name="year"
                    placeholder="Graduation year"
                    value={studentForm.year}
                    onChange={handleStudentInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CGPA *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cgpa"
                    placeholder="e.g., 8.2"
                    value={studentForm.cgpa}
                    onChange={handleStudentInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Resume URL</label>
                <input
                  type="url"
                  name="resume"
                  placeholder="http://..."
                  value={studentForm.resume}
                  onChange={handleStudentInputChange}
                />
              </div>

              <button type="submit" className="btn-submit">
                {isEditingStudent ? "Update Student" : "Add Student"}
              </button>
            </form>
          </div>

          {/* List of students */}
          {filteredStudents.length === 0 ? (
            <p className="empty-state">No students found</p>
          ) : (
            <div className="list-container">
              {filteredStudents.map((stu) => (
                <div key={stu.id} className="list-item">
                  <div className="item-header">
                    <h4>{stu.name}</h4>
                    <span className="badge">Year {stu.year}</span>
                  </div>
                  <div className="item-details">
                    <p>
                      <strong>Email:</strong> {stu.email}
                    </p>
                    <p>
                      <strong>CGPA:</strong> {stu.cgpa}
                    </p>
                    {stu.resume && (
                      <p>
                        <strong>Resume:</strong>{" "}
                        <a href={stu.resume} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="student-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEditStudent(stu)}
                      title="Edit student"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDeleteStudent(stu.id)}
                      title="Delete student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
