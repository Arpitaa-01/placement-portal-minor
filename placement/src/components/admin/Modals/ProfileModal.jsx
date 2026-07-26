import { X } from "lucide-react";

function ProfileModal({ profileForm, profileErrors, handleProfileInputChange, handleUpdateProfile, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Edit User Profile</h2>
          <button className="modal-close" onClick={onClose}>
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
  );
}

export default ProfileModal;
