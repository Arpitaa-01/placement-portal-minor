import { X } from "lucide-react";

function JobModal({ isEditingJob, jobForm, jobErrors, companies, handleJobInputChange, handleAddJob, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 {isEditingJob ? "Edit Job Post" : "Post New Job"}</h2>
          <button className="modal-close" onClick={onClose}>
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
  );
}

export default JobModal;
