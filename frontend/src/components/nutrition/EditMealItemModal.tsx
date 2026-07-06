import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { MealItem } from '@/types/nutrition'

interface EditMealItemModalProps {
  isOpen: boolean
  item: MealItem | null
  onClose: () => void
  onUpdate: (foodId: number, weightG: number) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function EditMealItemModal({
  isOpen,
  item,
  onClose,
  onUpdate,
  isSubmitting,
  error,
}: EditMealItemModalProps) {
  const [weightG, setWeightG] = useState('')

  useEffect(() => {
    if (isOpen && item) {
      setWeightG(String(item.weightG))
    }
  }, [isOpen, item])

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!item) return

    const parsed = parseFloat(weightG)
    if (!weightG || Number.isNaN(parsed) || parsed <= 0) {
      return
    }

    await onUpdate(item.food.id, parsed)
  }

  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Item">
      <div className="space-y-4">
        <div className="rounded-xl border border-ink-border bg-ink px-4 py-3">
          <p className="text-sm font-semibold text-white">{item.food.name}</p>
          <p className="text-xs text-white/50 mt-1">{item.itemCalories} kcal currently logged</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <FormField
            id="edit-item-weight"
            label="Portion size (grams)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="150"
            value={weightG}
            onChange={(e) => setWeightG(e.target.value)}
            disabled={isSubmitting}
            autoFocus
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
