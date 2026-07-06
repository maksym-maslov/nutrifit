import { apiClient } from '@/api/apiClient'
import {
  mapDailySummaryDto,
  mapExerciseDto,
  mapWorkoutLogDto,
  type DailySummary,
  type DailySummaryResponseDto,
  type Exercise,
  type ExerciseDictionaryResponseDto,
  type LogWorkoutRequest,
  type UpdateWorkoutRequest,
  type WorkoutLog,
  type WorkoutLogResponseDto,
} from '@/types/fitness'

export async function fetchExercises(): Promise<Exercise[]> {
  const { data } = await apiClient.get<ExerciseDictionaryResponseDto[]>('/exercises')
  return data.map(mapExerciseDto)
}

export async function logWorkout(payload: LogWorkoutRequest): Promise<WorkoutLog> {
  const { data } = await apiClient.post<WorkoutLogResponseDto>('/workouts', payload)
  return mapWorkoutLogDto(data)
}

export async function updateWorkout(
  id: number,
  payload: UpdateWorkoutRequest,
): Promise<WorkoutLog> {
  const { data } = await apiClient.put<WorkoutLogResponseDto>(`/workouts/${id}`, payload)
  return mapWorkoutLogDto(data)
}

export async function deleteWorkout(id: number): Promise<void> {
  await apiClient.delete(`/workouts/${id}`)
}

export async function fetchDailySummary(date: string): Promise<DailySummary> {
  const { data } = await apiClient.get<DailySummaryResponseDto>('/daily-summary', {
    params: { date },
  })
  return mapDailySummaryDto(data)
}

export async function fetchWorkoutsByDate(date: string): Promise<WorkoutLog[]> {
  const { data } = await apiClient.get<WorkoutLogResponseDto[]>('/workouts', {
    params: { date },
  })
  return data.map(mapWorkoutLogDto)
}
