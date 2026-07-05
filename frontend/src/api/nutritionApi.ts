import { apiClient } from '@/api/apiClient'
import {
  type FoodDictionaryResponseDto,
  type MealResponseDto,
  mapFoodDto,
  mapMealDto,
  type FoodItem,
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

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const { data } = await apiClient.get<FoodDictionaryResponseDto[]>(
    '/foods/search',
    { params: { query } },
  )
  return data.map(mapFoodDto)
}
