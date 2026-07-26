import { Building2, Briefcase } from "lucide-react";

function OverviewTab({ handleOpenAddCompanyModal, handleOpenAddJobModal }) {
  return (
    <div className="tab-content">
      <div className="overview-summary-section">
        <div className="overview-welcome-card">
          <div className="welcome-text">
            <h3>⚡ Quick Admin Actions</h3>
            <p>Manage placement portal activities efficiently. Add new companies or post job openings directly.</p>
          </div>
          <div className="overview-cta-row">
            <button
              className="btn-add-primary"
              onClick={handleOpenAddCompanyModal}
            >
              <Building2 size={18} /> Add New Company
            </button>
            <button
              className="btn-add-primary btn-job-accent"
              onClick={handleOpenAddJobModal}
            >
              <Briefcase size={18} /> Post New Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
