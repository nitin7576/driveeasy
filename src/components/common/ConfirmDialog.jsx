import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Confirm Action', message, confirmText = 'Confirm', onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} onConfirm={onConfirm} confirmText={confirmText} size="modal-sm">
      <p className="mb-0">{message}</p>
    </Modal>
  );
}