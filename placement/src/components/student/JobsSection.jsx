import { FileText } from "lucide-react";

function JobsSection({
  allJobsList,
  allJobs,
  appliedJobsList,
  jobsSubTab,
  setJobsSubTab,
  setViewingJobDesc,
  handleApplyJob,
  handleRevokeApplication,
}) {
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
}

export default JobsSection;
