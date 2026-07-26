function JobDescModal({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Description - {job.company}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', padding: '24px 36px' }}>
          <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px', color: '#1e293b' }}>
            {job.title}
          </div>
          <p>{job.description || "No description provided."}</p>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobDescModal;
