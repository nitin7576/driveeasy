import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, size = '', onConfirm, confirmText = 'Save', confirmEnabled = true }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(6,12,31,0.55)', zIndex: 1050 }}>
      <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body">{children}</div>
          {onConfirm && (
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-de" onClick={onConfirm} disabled={!confirmEnabled}>
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}