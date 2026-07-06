import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (isConfirming) return
    onCancel()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      panelClassName="max-w-sm"
      ariaLabelledBy="confirm-dialog-title"
      ariaDescribedBy="confirm-dialog-message"
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400"
            aria-hidden="true"
          >
            <TrashIcon />
          </div>
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <p id="confirm-dialog-message" className="mt-2 text-sm text-white/50 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isConfirming}
            className="flex-1 min-h-[44px] rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm font-medium text-white/80 hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isConfirming}
            className="flex-1 min-h-[44px] rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConfirming ? (
              <>
                <Spinner className="h-4 w-4 text-red-300" />
                {confirmLabel === 'Remove' ? 'Removing...' : 'Deleting...'}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
