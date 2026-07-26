import { Pencil, Trash2, Mail, Phone, MapPin, ExternalLink, Plus, X, Search } from "lucide-react";

function CompaniesTab({
  filteredCompanies,
  companySearchQuery,
  setCompanySearchQuery,
  handleOpenAddCompanyModal,
  handleEditCompany,
  handleDeleteCompany,
}) {
  return (
    <div className="tab-content">
      <div className="tab-header-row">
        <h3>Registered Companies ({filteredCompanies.length})</h3>
        <button
          className="btn-add-primary"
          onClick={handleOpenAddCompanyModal}
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      {/* Company Search Bar */}
      <div className="company-search-container">
        <div className="company-search-input-wrapper">
          <Search size={18} className="company-search-icon" />
          <input
            type="text"
            placeholder="Search by company name or location..."
            value={companySearchQuery}
            onChange={(e) => setCompanySearchQuery(e.target.value)}
            className="company-search-input"
          />
          {companySearchQuery && (
            <button
              className="company-search-clear-btn"
              onClick={() => setCompanySearchQuery("")}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {companySearchQuery && (
          <span className="search-results-count">
            Found {filteredCompanies.length} company{filteredCompanies.length !== 1 ? "ies" : ""}
          </span>
        )}
      </div>

      {filteredCompanies.length === 0 ? (
        <p className="empty-state">
          {companySearchQuery
            ? `No companies found matching "${companySearchQuery}"`
            : "No companies added yet"}
        </p>
      ) : (
        <div className="companies-grid">
          {filteredCompanies.map((company) => {
            const initial = company.name ? company.name.charAt(0).toUpperCase() : "C";
            return (
              <div key={company.id} className="company-card">
                <div className="company-card-header">
                  <div className="company-avatar-wrapper">
                    <div className="company-avatar">{initial}</div>
                    <div className="company-title-info">
                      <div className="company-name-row">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="company-name-link"
                            title={`Visit ${company.name} website (${company.website})`}
                          >
                            <span className="company-name">{company.name}</span>
                            <ExternalLink size={14} className="link-icon" />
                          </a>
                        ) : (
                          <h4 className="company-name" title={company.name}>{company.name}</h4>
                        )}
                      </div>
                      <span className="company-industry-tag">
                        {company.industry || "General"}
                      </span>
                    </div>
                  </div>
                  <div className="company-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEditCompany(company)}
                      title="Edit company"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDeleteCompany(company.id)}
                      title="Delete company"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="company-info-list">
                  <div className="company-info-item">
                    <Mail size={16} />
                    <span title={company.email}>{company.email || "N/A"}</span>
                  </div>
                  <div className="company-info-item">
                    <Phone size={16} />
                    <span title={company.phone}>{company.phone || "N/A"}</span>
                  </div>
                  <div className="company-info-item">
                    <MapPin size={16} />
                    <span title={company.location}>{company.location || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CompaniesTab;
