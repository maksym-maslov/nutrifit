import type { MacroGoals } from '@/types/user'

export interface Exercise {
  id: number
  name: string
  metValue: number
  category: string
}

export interface WorkoutLog {
  id: number
  exercise: Exercise
  durationMinutes: number
  caloriesBurned: number
  loggedAt: string
}

export interface DailySummary {
  date: string
  baseGoals: MacroGoals
  burnedCalories: number
  adjustedGoals: MacroGoals
  consumed: MacroGoals
}

export interface LogWorkoutRequest {
  exerciseId: number
  durationMinutes: number
  loggedAt: string
}

export interface UpdateWorkoutRequest {
  exerciseId: number
  durationMinutes: number
}

export interface ExerciseDictionaryResponseDto {
  id: number
  name: string
  metValue: number
  category: string
}

export interface WorkoutLogResponseDto {
  id: number
  exercise: ExerciseDictionaryResponseDto
  durationMinutes: number
  caloriesBurned: number
  loggedAt: string
}

export interface DailySummaryResponseDto {
  date: string
  totalCaloriesConsumed: number
  totalProteinConsumed: number
  totalCarbsConsumed: number
  totalFatConsumed: number
  totalCaloriesBurned: number
  baseCalories: number
  baseProtein: number
  baseCarbs: number
  baseFat: number
  adjustedCalories: number
  adjustedProtein: number
  adjustedCarbs: number
  adjustedFat: number
}

export function mapExerciseDto(dto: ExerciseDictionaryResponseDto): Exercise {
  return {
    id: dto.id,
    name: dto.name,
    metValue: dto.metValue,
    category: dto.category,
  }
}

export function mapWorkoutLogDto(dto: WorkoutLogResponseDto): WorkoutLog {
  return {
    id: dto.id,
    exercise: mapExerciseDto(dto.exercise),
    durationMinutes: dto.durationMinutes,
    caloriesBurned: dto.caloriesBurned,
    loggedAt: dto.loggedAt,
  }
}

export function mapDailySummaryDto(dto: DailySummaryResponseDto): DailySummary {
  return {
    date: dto.date,
    baseGoals: {
      calories: dto.baseCalories,
      protein: dto.baseProtein,
      carbs: dto.baseCarbs,
      fat: dto.baseFat,
    },
    burnedCalories: dto.totalCaloriesBurned,
    adjustedGoals: {
      calories: dto.adjustedCalories,
      protein: dto.adjustedProtein,
      carbs: dto.adjustedCarbs,
      fat: dto.adjustedFat,
    },
    consumed: {
      calories: dto.totalCaloriesConsumed,
      protein: dto.totalProteinConsumed,
      carbs: dto.totalCarbsConsumed,
      fat: dto.totalFatConsumed,
    },
  }
}

export function computeEarnedGoals(base: MacroGoals, adjusted: MacroGoals): MacroGoals {
  return {
    calories: adjusted.calories - base.calories,
    protein: adjusted.protein - base.protein,
    carbs: adjusted.carbs - base.carbs,
    fat: adjusted.fat - base.fat,
  }
}
