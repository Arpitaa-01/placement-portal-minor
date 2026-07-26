function JobDescModal({ job, onClose }) {
  if (!job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1.5px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Job Description
            </p>
            <h3 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
              {job.company} — {job.title}
            </h3>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            title="Close"
            style={{ flexShrink: 0, marginLeft: '12px' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: '60vh',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.7',
            color: '#334155',
            fontSize: '0.95rem',
          }}
        >
          {job.description || "No description provided."}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1.5px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            borderRadius: '0 0 16px 16px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '9px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
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
