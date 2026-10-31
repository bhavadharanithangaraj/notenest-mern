// "Are you sure?" dialog built on Modal, used before deleting a note.
import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onClose} size="sm">
      <p className="muted" style={{ margin: 0 }}>{message}</p>
      <div className="modal-foot">
        <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={confirm} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
