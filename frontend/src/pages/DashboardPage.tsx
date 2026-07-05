import { useCallback, useMemo, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { DateNavigator } from '@/components/nutrition/DateNavigator'
import { DailySummaryCard } from '@/components/nutrition/DailySummaryCard'
import { MealsList } from '@/components/nutrition/MealsList'
import { CreateMealModal } from '@/components/nutrition/CreateMealModal'
import { FoodSearchPanel } from '@/components/nutrition/FoodSearchPanel'
import { useMealsByDate } from '@/hooks/useMealsByDate'
import { useMealTracker } from '@/hooks/useMealTracker'
import { addDays, isSameDay, startOfToday, toApiDate } from '@/utils/dateUtils'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(startOfToday)
  const [activeMealId, setActiveMealId] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedMealIds, setExpandedMealIds] = useState<Set<number>>(new Set())
  const [fallbackMealName, setFallbackMealName] = useState('')
  const foodSearchRef = useRef<HTMLDivElement>(null)

  const dateKey = toApiDate(selectedDate)
  const { meals, isLoading, error, refetch, setMeals } = useMealsByDate(dateKey)
  const {
    isSubmitting,
    error: trackerError,
    clearError,
    createMeal,
    addItem,
  } = useMealTracker(setMeals)

  const dailySummary = useMemo(
    () =>
      meals.reduce(
        (acc, meal) => ({
          totalCalories: acc.totalCalories + meal.totalCalories,
          totalProtein: acc.totalProtein + meal.totalProtein,
          totalCarbs: acc.totalCarbs + meal.totalCarbs,
          totalFat: acc.totalFat + meal.totalFat,
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
      ),
    [meals],
  )

  const activeMeal = meals.find((m) => m.id === activeMealId) ?? null

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
    },
    [createMeal, selectedDate, activateMeal, setMeals],
  )

  const handleLogItem = useCallback(
    async (foodId: number, weightG: number): Promise<boolean> => {
      if (!activeMealId) return false
      const result = await addItem(activeMealId, foodId, weightG)
      return result !== null
    },
    [activeMealId, addItem],
  )

  const viewingPastDate = !isSameDay(selectedDate, startOfToday())

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

        <DailySummaryCard summary={dailySummary} />

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
        />

        {activeMealId !== null && (
          <div ref={foodSearchRef}>
            <FoodSearchPanel
              activeMealId={activeMealId}
              activeMealName={activeMeal?.name ?? fallbackMealName}
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
    </AppShell>
  )
}
