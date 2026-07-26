import { Pencil, Trash2, MapPin, DollarSign, Clock, Calendar, FileText, Plus, X, Search, Briefcase } from "lucide-react";

function JobsTab({
  filteredJobs,
  jobSearchQuery,
  setJobSearchQuery,
  handleOpenAddJobModal,
  handleEditJob,
  handleDeleteJob,
  setViewingJobDesc,
}) {
  return (
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
  );
}

export default JobsTab;
