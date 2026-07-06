import { useCallback, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { DateNavigator } from '@/components/nutrition/DateNavigator'
import { DailySummaryCard } from '@/components/nutrition/DailySummaryCard'
import { MealsList } from '@/components/nutrition/MealsList'
import { CreateMealModal } from '@/components/nutrition/CreateMealModal'
import { EditMealModal } from '@/components/nutrition/EditMealModal'
import { EditMealItemModal } from '@/components/nutrition/EditMealItemModal'
import { FoodSearchPanel } from '@/components/nutrition/FoodSearchPanel'
import { SmartRecommendations } from '@/components/nutrition/SmartRecommendations'
import { LogWorkoutPanel } from '@/components/fitness/LogWorkoutPanel'
import { EditWorkoutModal } from '@/components/fitness/EditWorkoutModal'
import { WorkoutsList } from '@/components/fitness/WorkoutsList'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useMealsByDate } from '@/hooks/useMealsByDate'
import { useMealTracker } from '@/hooks/useMealTracker'
import { useDailySummary } from '@/hooks/useDailySummary'
import { useWorkoutsByDate } from '@/hooks/useWorkoutsByDate'
import { useExercises } from '@/hooks/useExercises'
import { useWorkoutTracker } from '@/hooks/useWorkoutTracker'
import { addDays, isSameDay, startOfToday, toApiDate, toApiDateTime } from '@/utils/dateUtils'
import {
  getRecentExercisesFromWorkouts,
  getRecentFoodsFromMeals,
} from '@/utils/searchPickerUtils'
import type { MealItem } from '@/types/nutrition'

type DeleteTarget =
  | { type: 'meal'; mealId: number; name: string }
  | { type: 'item'; mealId: number; itemId: number; label: string }
  | { type: 'workout'; workoutId: number; label: string }

function getDeleteDialogCopy(target: DeleteTarget): { title: string; message: string } {
  switch (target.type) {
    case 'meal':
      return {
        title: 'Delete meal?',
        message: `Delete ${target.name} and all its items? This cannot be undone.`,
      }
    case 'item':
      return {
        title: 'Remove item?',
        message: `Remove ${target.label} from this meal?`,
      }
    case 'workout':
      return {
        title: 'Delete workout?',
        message: `Delete ${target.label}? This cannot be undone.`,
      }
  }
}

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(startOfToday)
  const [activeMealId, setActiveMealId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMealId, setEditingMealId] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<MealItem | null>(null)
  const [editingItemMealId, setEditingItemMealId] = useState<number | null>(null)
  const [isLogWorkoutOpen, setIsLogWorkoutOpen] = useState(false)
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null)
  const [expandedMealIds, setExpandedMealIds] = useState<Set<number>>(new Set())
  const [fallbackMealName, setFallbackMealName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const foodSearchRef = useRef<HTMLDivElement>(null)

  const dateKey = toApiDate(selectedDate)
  const { meals, isLoading, error, refetch, setMeals } = useMealsByDate(dateKey)
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useDailySummary(dateKey)
  const {
    workouts,
    isLoading: isWorkoutsLoading,
    error: workoutsError,
    refetch: refetchWorkouts,
    setWorkouts,
  } = useWorkoutsByDate(dateKey)
  const {
    exercises,
    isLoading: isExercisesLoading,
    error: exercisesError,
  } = useExercises()

  const refreshSynergyData = useCallback(async () => {
    await Promise.all([refetchSummary(), refetchWorkouts()])
  }, [refetchSummary, refetchWorkouts])

  const {
    isSubmitting,
    error: trackerError,
    clearError,
    createMeal,
    addItem,
    updateMealName,
    removeMeal,
    updateItem,
    removeItem,
  } = useMealTracker(setMeals)

  const {
    isSubmitting: isWorkoutSubmitting,
    error: workoutTrackerError,
    clearError: clearWorkoutError,
    logWorkoutEntry,
    updateWorkoutEntry,
    removeWorkoutEntry,
  } = useWorkoutTracker(setWorkouts, refreshSynergyData)

  const activeMeal = meals.find((m) => m.id === activeMealId) ?? null
  const editingMeal = meals.find((m) => m.id === editingMealId) ?? null
  const editingWorkout = workouts.find((w) => w.id === editingWorkoutId) ?? null
  const recentFoods = useMemo(() => getRecentFoodsFromMeals(meals), [meals])
  const recentExercises = useMemo(() => getRecentExercisesFromWorkouts(workouts), [workouts])

  const scrollToFoodSearch = useCallback(() => {
    requestAnimationFrame(() => {
      foodSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const activateMeal = useCallback(
    (mealId: number) => {
      clearError()
      setActiveMealId(mealId)
      setExpandedMealIds((prev) => new Set(prev).add(mealId))
      scrollToFoodSearch()
    },
    [clearError, scrollToFoodSearch],
  )

  const handleToggleExpand = useCallback((mealId: number) => {
    setExpandedMealIds((prev) => {
      const next = new Set(prev)
      if (next.has(mealId)) {
        next.delete(mealId)
      } else {
        next.add(mealId)
      }
      return next
    })
  }, [])

  const handleCreateMeal = useCallback(
    async (name: string) => {
      const meal = await createMeal(name)
      if (!meal) return

      setIsCreateModalOpen(false)
      setFallbackMealName(meal.name)

      if (!isSameDay(selectedDate, startOfToday())) {
        setMeals((prev) => prev.filter((m) => m.id !== meal.id))
        setSelectedDate(startOfToday())
      }

      activateMeal(meal.id)
      await refetchSummary()
    },
    [createMeal, selectedDate, activateMeal, setMeals, refetchSummary],
  )

  const handleLogItem = useCallback(
    async (foodId: number, weightG: number): Promise<boolean> => {
      if (!activeMealId) return false
      const result = await addItem(activeMealId, foodId, weightG)
      if (result !== null) {
        await refetchSummary()
        return true
      }
      return false
    },
    [activeMealId, addItem, refetchSummary],
  )

  const handleEditMeal = useCallback(
    (mealId: number) => {
      clearError()
      setEditingMealId(mealId)
    },
    [clearError],
  )

  const handleUpdateMeal = useCallback(
    async (name: string) => {
      if (editingMealId === null) return
      const result = await updateMealName(editingMealId, name)
      if (result !== null) {
        setEditingMealId(null)
        await refetchSummary()
      }
    },
    [editingMealId, updateMealName, refetchSummary],
  )

  const handleDeleteMeal = useCallback(
    (mealId: number) => {
      const meal = meals.find((m) => m.id === mealId)
      if (!meal) return
      clearError()
      setDeleteTarget({ type: 'meal', mealId, name: meal.name })
    },
    [meals, clearError],
  )

  const handleEditItem = useCallback(
    (mealId: number, item: MealItem) => {
      clearError()
      setEditingItemMealId(mealId)
      setEditingItem(item)
    },
    [clearError],
  )

  const handleUpdateItem = useCallback(
    async (foodId: number, weightG: number) => {
      if (editingItemMealId === null || editingItem === null) return
      const result = await updateItem(editingItemMealId, editingItem.id, foodId, weightG)
      if (result !== null) {
        setEditingItem(null)
        setEditingItemMealId(null)
        await refetchSummary()
      }
    },
    [editingItemMealId, editingItem, updateItem, refetchSummary],
  )

  const handleDeleteItem = useCallback(
    (mealId: number, itemId: number) => {
      const meal = meals.find((m) => m.id === mealId)
      const item = meal?.mealItems.find((i) => i.id === itemId)
      if (!item) return
      clearError()
      setDeleteTarget({
        type: 'item',
        mealId,
        itemId,
        label: `${item.weightG}g ${item.food.name}`,
      })
    },
    [meals, clearError],
  )

  const handleLogWorkout = useCallback(
    async (exerciseId: number, durationMinutes: number): Promise<boolean> => {
      const result = await logWorkoutEntry({
        exerciseId,
        durationMinutes,
        loggedAt: toApiDateTime(selectedDate),
      })
      return result !== null
    },
    [logWorkoutEntry, selectedDate],
  )

  const handleEditWorkout = useCallback(
    (workoutId: number) => {
      clearWorkoutError()
      setEditingWorkoutId(workoutId)
    },
    [clearWorkoutError],
  )

  const handleUpdateWorkout = useCallback(
    async (exerciseId: number, durationMinutes: number) => {
      if (editingWorkoutId === null) return
      const result = await updateWorkoutEntry(editingWorkoutId, {
        exerciseId,
        durationMinutes,
      })
      if (result !== null) {
        setEditingWorkoutId(null)
        await refetchSummary()
      }
    },
    [editingWorkoutId, updateWorkoutEntry, refetchSummary],
  )

  const handleDeleteWorkout = useCallback(
    (workoutId: number) => {
      const workout = workouts.find((w) => w.id === workoutId)
      if (!workout) return
      clearWorkoutError()
      setDeleteTarget({
        type: 'workout',
        workoutId,
        label: `${workout.exercise.name} (${workout.durationMinutes} min)`,
      })
    },
    [workouts, clearWorkoutError],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget === null) return

    if (deleteTarget.type === 'meal') {
      const { mealId } = deleteTarget
      const success = await removeMeal(mealId)
      if (success) {
        if (activeMealId === mealId) {
          setActiveMealId(null)
        }
        setExpandedMealIds((prev) => {
          const next = new Set(prev)
          next.delete(mealId)
          return next
        })
        if (editingMealId === mealId) {
          setEditingMealId(null)
        }
        setDeleteTarget(null)
        await refetchSummary()
      }
      return
    }

    if (deleteTarget.type === 'item') {
      const { mealId, itemId } = deleteTarget
      const result = await removeItem(mealId, itemId)
      if (result !== null) {
        if (editingItem?.id === itemId) {
          setEditingItem(null)
          setEditingItemMealId(null)
        }
        setDeleteTarget(null)
        await refetchSummary()
      }
      return
    }

    const { workoutId } = deleteTarget
    const success = await removeWorkoutEntry(workoutId)
    if (success) {
      if (editingWorkoutId === workoutId) {
        setEditingWorkoutId(null)
      }
      setDeleteTarget(null)
      await refetchSummary()
    }
  }, [
    deleteTarget,
    removeMeal,
    removeItem,
    removeWorkoutEntry,
    activeMealId,
    editingMealId,
    editingItem,
    editingWorkoutId,
    refetchSummary,
  ])

  const viewingPastDate = !isSameDay(selectedDate, startOfToday())
  const deleteDialogCopy =
    deleteTarget !== null ? getDeleteDialogCopy(deleteTarget) : null

  return (
    <AppShell>
      <div className="space-y-5">
        <DateNavigator
          date={selectedDate}
          onPrevious={() => setSelectedDate((d) => addDays(d, -1))}
          onNext={() => setSelectedDate((d) => addDays(d, 1))}
        />

        {viewingPastDate && (
          <p className="text-xs text-white/40 text-center">
            New meals are logged to today. Switch to today to add food.
          </p>
        )}

        <DailySummaryCard
          summary={summary}
          isLoading={isSummaryLoading}
          error={summaryError}
          onRetry={() => void refetchSummary()}
        />

        <SmartRecommendations
          date={dateKey}
          activeMealId={activeMealId}
          onLogItem={handleLogItem}
          onLogSuccess={() => void refetchSummary()}
          onNeedMeal={() => {
            clearError()
            setIsCreateModalOpen(true)
          }}
          isSubmitting={isSubmitting}
        />

        <MealsList
          meals={meals}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          onAddMeal={() => {
            clearError()
            setIsCreateModalOpen(true)
          }}
          expandedMealIds={expandedMealIds}
          activeMealId={activeMealId}
          onToggleExpand={handleToggleExpand}
          onAddFood={activateMeal}
          onEditMeal={handleEditMeal}
          onDeleteMeal={handleDeleteMeal}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

        {activeMealId !== null && (
          <div ref={foodSearchRef}>
            <FoodSearchPanel
              activeMealId={activeMealId}
              activeMealName={activeMeal?.name ?? fallbackMealName}
              recentFoods={recentFoods}
              onDone={() => {
                clearError()
                setActiveMealId(null)
              }}
              onLogItem={handleLogItem}
              isSubmitting={isSubmitting}
              error={trackerError}
            />
          </div>
        )}

        <WorkoutsList
          workouts={workouts}
          isLoading={isWorkoutsLoading}
          error={workoutsError}
          onRetry={() => void refetchWorkouts()}
          onLogWorkout={() => {
            clearWorkoutError()
            setIsLogWorkoutOpen(true)
          }}
          onEditWorkout={handleEditWorkout}
          onDeleteWorkout={handleDeleteWorkout}
        />

        {isLogWorkoutOpen && (
          <LogWorkoutPanel
            exercises={exercises}
            recentExercises={recentExercises}
            isLoadingExercises={isExercisesLoading}
            exercisesError={exercisesError}
            onClose={() => {
              if (!isWorkoutSubmitting) setIsLogWorkoutOpen(false)
            }}
            onLogWorkout={handleLogWorkout}
            isSubmitting={isWorkoutSubmitting}
            error={workoutTrackerError}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          clearError()
          setIsCreateModalOpen(true)
        }}
        className="fixed bottom-6 right-6 z-30 flex h-14 items-center gap-2 rounded-2xl bg-mint px-5 text-sm font-bold text-ink shadow-lg shadow-mint/20 hover:bg-mint-dark transition-all active:scale-95 sm:right-[calc(50%-16rem+1.5rem)]"
        aria-label="Add meal"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        Add Meal
      </button>

      <CreateMealModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsCreateModalOpen(false)
        }}
        onCreate={handleCreateMeal}
        isSubmitting={isSubmitting}
        error={trackerError}
      />

      <EditMealModal
        isOpen={editingMealId !== null}
        initialName={editingMeal?.name ?? ''}
        onClose={() => {
          if (!isSubmitting) setEditingMealId(null)
        }}
        onUpdate={handleUpdateMeal}
        isSubmitting={isSubmitting}
        error={trackerError}
      />

      <EditMealItemModal
        isOpen={editingItem !== null}
        item={editingItem}
        onClose={() => {
          if (!isSubmitting) {
            setEditingItem(null)
            setEditingItemMealId(null)
          }
        }}
        onUpdate={handleUpdateItem}
        isSubmitting={isSubmitting}
        error={trackerError}
      />

      <EditWorkoutModal
        isOpen={editingWorkoutId !== null}
        workout={editingWorkout}
        exercises={exercises}
        recentExercises={recentExercises}
        isLoadingExercises={isExercisesLoading}
        onClose={() => {
          if (!isWorkoutSubmitting) setEditingWorkoutId(null)
        }}
        onUpdate={handleUpdateWorkout}
        isSubmitting={isWorkoutSubmitting}
        error={workoutTrackerError}
      />

      {deleteTarget !== null && deleteDialogCopy !== null && (
        <ConfirmDialog
          isOpen
          title={deleteDialogCopy.title}
          message={deleteDialogCopy.message}
          confirmLabel={deleteTarget.type === 'item' ? 'Remove' : 'Delete'}
          isConfirming={isSubmitting || isWorkoutSubmitting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AppShell>
  )
}
