import { apiClient } from '@/api/apiClient'
import {
  type FoodDictionaryResponseDto,
  type MealResponseDto,
  mapFoodDto,
  mapMealDto,
  mapRecommendationDto,
  type FoodItem,
  type FoodRecommendation,
  type Meal,
} from '@/types/nutrition'

export async function fetchMealsByDate(date: string): Promise<Meal[]> {
  const { data } = await apiClient.get<MealResponseDto[]>('/meals', {
    params: { date },
  })
  return data.map(mapMealDto)
}

export async function createMeal(name: string): Promise<Meal> {
  const { data } = await apiClient.post<MealResponseDto>('/meals', { name })
  return mapMealDto(data)
}

export async function addMealItem(
  mealId: number,
  foodId: number,
  weightG: number,
): Promise<Meal> {
  const { data } = await apiClient.post<MealResponseDto>(
    `/meals/${mealId}/items`,
    { foodId, weightG },
  )
  return mapMealDto(data)
}

export async function updateMeal(mealId: number, name: string): Promise<Meal> {
  const { data } = await apiClient.put<MealResponseDto>(`/meals/${mealId}`, { name })
  return mapMealDto(data)
}

export async function deleteMeal(mealId: number): Promise<void> {
  await apiClient.delete(`/meals/${mealId}`)
}

export async function updateMealItem(
  mealId: number,
  itemId: number,
  foodId: number,
  weightG: number,
): Promise<Meal> {
  const { data } = await apiClient.put<MealResponseDto>(
    `/meals/${mealId}/items/${itemId}`,
    { foodId, weightG },
  )
  return mapMealDto(data)
}

export async function deleteMealItem(mealId: number, itemId: number): Promise<Meal> {
  const { data } = await apiClient.delete<MealResponseDto>(
    `/meals/${mealId}/items/${itemId}`,
  )
  return mapMealDto(data)
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const { data } = await apiClient.get<FoodDictionaryResponseDto[]>(
    '/foods/search',
    { params: { query } },
  )
  return data.map(mapFoodDto)
}

export async function fetchRecommendations(date: string): Promise<FoodRecommendation[]> {
  const { data } = await apiClient.get<FoodDictionaryResponseDto[]>('/recommendations', {
    params: { date },
  })
  return data.map(mapRecommendationDto)
}
