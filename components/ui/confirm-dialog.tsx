"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? "Please wait…" : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
