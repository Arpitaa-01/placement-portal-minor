import { Trash2, FileText } from "lucide-react";

function StudentsTab({
  jobs,
  selectedJobId,
  setSelectedJobId,
  applicants,
  loadingApplicants,
  handleRemoveApplication,
}) {
  return (
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
  );
}

export default StudentsTab;
