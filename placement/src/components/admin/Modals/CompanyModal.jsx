import { X } from "lucide-react";

function CompanyModal({ isEditingCompany, companyForm, companyErrors, handleCompanyInputChange, handleAddCompany, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏢 {isEditingCompany ? "Edit Company" : "Add New Company"}</h2>
          <button className="modal-close" onClick={onClose}>
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
  );
}

export default CompanyModal;
