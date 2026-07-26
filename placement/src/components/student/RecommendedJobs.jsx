import { FileText } from "lucide-react";

function RecommendedJobs({ studentProfile, allJobsList, allJobs, appliedJobsList, setActiveSection, setViewingJobDesc, handleApplyJob }) {
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
}

export default RecommendedJobs;
