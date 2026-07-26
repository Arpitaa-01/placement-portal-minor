function ProfileSection({
  studentProfile,
  profileForm,
  isEditingProfile,
  successMessage,
  handleProfileInputChange,
  handleSaveProfile,
  handleStartEditingProfile,
  handleCancelProfileEdit,
}) {
  return (
    <div className="section-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👤 {studentProfile.name}'s Profile</h2>
        {!isEditingProfile && (
          <button
            className="btn-submit"
            onClick={handleStartEditingProfile}
            style={{ padding: '10px 22px', fontSize: '0.95rem' }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Profile Completion Bar */}
      {(() => {
        const completion = studentProfile.profileCompletion;
        return (
          <div className="profile-completion" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', color: '#334155' }}>Profile Completion</span>
              <span style={{ fontWeight: '700', color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#e53e3e' }}>
                {completion}%
              </span>
            </div>
            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{
                  width: `${completion}%`,
                  background: completion >= 80
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : completion >= 50
                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                      : 'linear-gradient(90deg, #e53e3e, #c53030)',
                  transition: 'width 0.6s ease'
                }}
              ></div>
            </div>
            {completion < 80 && (
              <p className="completion-alert" style={{ marginTop: '8px' }}>
                {completion < 50
                  ? 'Your profile is incomplete. Fill in your details to get noticed by recruiters!'
                  : 'Almost there! A few more details will complete your profile.'}
              </p>
            )}
            {studentProfile.profileVerified && (
              <p className="verified-badge" style={{ marginTop: '8px' }}>✓ Profile Verified by Admin</p>
            )}
          </div>
        );
      })()}

      {successMessage && <div className="success-message">✓ {successMessage}</div>}

      {isEditingProfile ? (
        <div className="profile-edit-form">
          <h3 style={{ marginBottom: '20px', color: '#334155', fontSize: '1.1rem' }}>Edit Your Profile</h3>
          {/* Personal Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={profileForm.name || ''}
                onChange={handleProfileInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={profileForm.email || ''}
                onChange={handleProfileInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9876543210"
                maxLength={10}
                value={profileForm.phone || ''}
                onChange={handleProfileInputChange}
              />
            </div>
            <div className="form-group">
              <label>Enrollment Number</label>
              <input
                type="text"
                name="enrollment"
                placeholder="e.g. MCA2024001"
                value={profileForm.enrollment || ''}
                onChange={handleProfileInputChange}
              />
            </div>
          </div>
          {/* Academic Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                placeholder="e.g. MCA, BCA, B.Tech"
                value={profileForm.course || ''}
                onChange={handleProfileInputChange}
              />
            </div>
            <div className="form-group">
              <label>Batch Year (YYYY)</label>
              <input
                type="text"
                name="batchYear"
                placeholder="e.g. 2024"
                value={profileForm.batchYear || ''}
                onChange={handleProfileInputChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                placeholder="e.g. 8.5"
                value={profileForm.cgpa || ''}
                onChange={handleProfileInputChange}
              />
            </div>
            <div className="form-group">
              <label>Resume URL / Filename</label>
              <input
                type="text"
                name="resume"
                placeholder="e.g. Resume_2024.pdf or a URL"
                value={profileForm.resume || ''}
                onChange={handleProfileInputChange}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Skills (comma separated values)</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g. Java, React, SQL"
              value={profileForm.skills || ""}
              onChange={handleProfileInputChange}
            />
          </div>
          <div className="button-row" style={{ marginTop: '20px' }}>
            <button className="btn-submit" onClick={handleSaveProfile}>💾 Save Profile</button>
            <button className="btn-cancel" onClick={handleCancelProfileEdit} type="button">✕ Cancel</button>
          </div>
        </div>
      ) : (
        <div className="profile-grid">
          <div className="profile-card">
            <h3>Personal Details</h3>
            <div className="profile-field"><label>Name:</label><p>{studentProfile.name || '—'}</p></div>
            <div className="profile-field"><label>Email:</label><p>{studentProfile.email || '—'}</p></div>
            <div className="profile-field"><label>Phone:</label><p>{studentProfile.phone || 'Not set'}</p></div>
            <div className="profile-field"><label>Enrollment:</label><p>{studentProfile.enrollment || 'Not set'}</p></div>
          </div>
          <div className="profile-card">
            <h3>Academic Details</h3>
            <div className="profile-field"><label>Course:</label><p>{studentProfile.course || 'Not set'}</p></div>
            <div className="profile-field"><label>Batch Year:</label><p>{studentProfile.batchYear || 'Not set'}</p></div>
            <div className="profile-field"><label>CGPA:</label><p>{studentProfile.cgpa || '—'}</p></div>
          </div>
          <div className="profile-card">
            <h3>Resume</h3>
            <div className="profile-field"><label>Resume:</label><p style={{ wordBreak: 'break-all' }}>{studentProfile.resume || 'No resume set'}</p></div>
          </div>
          <div className="profile-card">
            <h3>Skills</h3>
            <div className="profile-field">
              {studentProfile.skills && studentProfile.skills.trim() !== "" ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {studentProfile.skills.split(",").map((skill, index) => (
                    <span key={index} className="job-skill-tag">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
