import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { FoodItem } from '@/types/nutrition'

interface PortionInputOverlayProps {
  food: FoodItem | null
  mealId: number
  onClose: () => void
  onLogItem: (weightG: number) => Promise<boolean>
  isSubmitting: boolean
}

export function PortionInputOverlay({
  food,
  mealId,
  onClose,
  onLogItem,
  isSubmitting,
}: PortionInputOverlayProps) {
  const [weightG, setWeightG] = useState('')
  const [fieldError, setFieldError] = useState<string | undefined>()

  useEffect(() => {
    if (food) {
      setWeightG('')
      setFieldError(undefined)
    }
  }, [food])

  const handleClose = () => {
    if (isSubmitting) return
    setWeightG('')
    setFieldError(undefined)
    onClose()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = parseFloat(weightG)
    if (!weightG || Number.isNaN(parsed) || parsed <= 0) {
      setFieldError('Enter a valid weight greater than 0.')
      return
    }
    setFieldError(undefined)
    const success = await onLogItem(parsed)
    if (success) {
      setWeightG('')
    }
  }

  if (!food) return null

  return (
    <Modal isOpen={!!food} onClose={handleClose} title="Log Portion">
      <div className="space-y-4">
        <div className="rounded-xl border border-ink-border bg-ink px-4 py-3">
          <p className="text-sm font-semibold text-white">{food.name}</p>
          {food.brand && (
            <p className="text-xs text-white/40 mt-0.5">{food.brand}</p>
          )}
          <p className="text-xs text-white/50 mt-2">
            {food.caloriesPer100g} kcal · P {food.proteinPer100g}g · C{' '}
            {food.carbsPer100g}g · F {food.fatPer100g}g per 100g
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <FormField
            id={`portion-weight-${mealId}`}
            label="Portion size (grams)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="150"
            value={weightG}
            onChange={(e) => {
              setWeightG(e.target.value)
              if (fieldError) setFieldError(undefined)
            }}
            error={fieldError}
            disabled={isSubmitting}
            autoFocus
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-mint py-3 text-sm font-semibold text-ink hover:bg-mint-dark transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 text-ink" />
                Logging...
              </>
            ) : (
              'Log Item'
            )}
          </button>
        </form>
      </div>
    </Modal>
  )
}
