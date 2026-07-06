import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/FormField'
import { Spinner } from '@/components/ui/Spinner'
import { MEAL_PRESETS } from '@/types/nutrition'

interface EditMealModalProps {
  isOpen: boolean
  initialName: string
  onClose: () => void
  onUpdate: (name: string) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function EditMealModal({
  isOpen,
  initialName,
  onClose,
  onUpdate,
  isSubmitting,
  error,
}: EditMealModalProps) {
  const [name, setName] = useState(initialName)
  const [fieldError, setFieldError] = useState<string | undefined>()

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setFieldError(undefined)
    }
  }, [isOpen, initialName])

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handlePreset = async (preset: string) => {
    await onUpdate(preset)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setFieldError('Meal name is required.')
      return
    }
    setFieldError(undefined)
    await onUpdate(trimmed)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Meal">
      <div className="space-y-5">
        <div>
          <p className="text-sm text-white/50 mb-3">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {MEAL_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={isSubmitting}
                onClick={() => void handlePreset(preset)}
                className="rounded-xl border border-ink-border bg-ink px-4 py-2 text-sm font-medium text-white/80 hover:border-mint/40 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-ink-border" />
          <p className="relative text-center">
            <span className="bg-ink-light px-3 text-xs text-white/30">or custom</span>
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <FormField
            id="edit-meal-name"
            label="Meal name"
            placeholder="Post-Workout Fuel"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (fieldError) setFieldError(undefined)
            }}
            error={fieldError}
            disabled={isSubmitting}
          />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-mint py-3 text-sm font-semibold text-ink hover:bg-mint-dark transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 text-ink" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </Modal>
  )
}
