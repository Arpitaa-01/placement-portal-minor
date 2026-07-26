function ApplicationsSection({ appliedJobsList, appliedJobs, setActiveSection, setJobsSubTab, handleRevokeApplication }) {
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
}

export default ApplicationsSection;
