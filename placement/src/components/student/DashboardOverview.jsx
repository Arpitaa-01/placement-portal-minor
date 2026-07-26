import RecommendedJobs from "./RecommendedJobs";

function DashboardOverview({ allJobsList, allJobs, appliedJobsList, appliedJobs, studentProfile, setActiveSection, setViewingJobDesc, handleApplyJob }) {
  const totalJobsCount = (allJobsList && allJobsList.length > 0) ? allJobsList.length : (allJobs ? allJobs.length : 0);
  const jobsAppliedCount = (appliedJobsList && appliedJobsList.length > 0) ? appliedJobsList.length : (appliedJobs ? appliedJobs.length : 0);

  const stats = [
    { icon: "📄", label: "Total Jobs Available", value: totalJobsCount },
    { icon: "📝", label: "Jobs Applied", value: jobsAppliedCount },
  ];

  return (
    <div className="section-content">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <RecommendedJobs
        studentProfile={studentProfile}
        allJobsList={allJobsList}
        allJobs={allJobs}
        appliedJobsList={appliedJobsList}
        setActiveSection={setActiveSection}
        setViewingJobDesc={setViewingJobDesc}
        handleApplyJob={handleApplyJob}
      />
    </div>
  );
}

export default DashboardOverview;
