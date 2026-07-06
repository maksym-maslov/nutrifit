export interface FoodItem {
  id: number
  name: string
  brand: string | null
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface FoodRecommendation {
  id: number
  name: string
  brand: string | null
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface MealItem {
  id: number
  food: FoodItem
  weightG: number
  itemCalories: number
  itemProtein: number
  itemCarbs: number
  itemFat: number
}

export interface Meal {
  id: number
  name: string
  loggedAt: string
  mealItems: MealItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface CreateMealRequest {
  name: string
}

export interface AddMealItemRequest {
  foodId: number
  weightG: number
}

export interface UpdateMealRequest {
  name: string
}

export interface UpdateMealItemRequest {
  foodId: number
  weightG: number
}

export interface FoodDictionaryResponseDto {
  id: number
  name: string
  brand: string | null
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface MealItemResponseDto {
  id: number
  foodId: number
  foodName: string
  weightG: number
  itemCalories: number
  itemProtein: number
  itemCarbs: number
  itemFat: number
}

export interface MealResponseDto {
  id: number
  name: string
  loggedAt: string
  createdAt: string
  items: MealItemResponseDto[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export const MEAL_PRESETS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const

export type MealPreset = (typeof MEAL_PRESETS)[number]

export function mapFoodDto(dto: FoodDictionaryResponseDto): FoodItem {
  return {
    id: dto.id,
    name: dto.name,
    brand: dto.brand,
    caloriesPer100g: dto.caloriesPer100g,
    proteinPer100g: dto.proteinPer100g,
    carbsPer100g: dto.carbsPer100g,
    fatPer100g: dto.fatPer100g,
  }
}

export function mapRecommendationDto(dto: FoodDictionaryResponseDto): FoodRecommendation {
  return mapFoodDto(dto)
}

export function mapMealItemDto(dto: MealItemResponseDto): MealItem {
  return {
    id: dto.id,
    food: {
      id: dto.foodId,
      name: dto.foodName,
      brand: null,
      caloriesPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
    },
    weightG: dto.weightG,
    itemCalories: dto.itemCalories,
    itemProtein: dto.itemProtein,
    itemCarbs: dto.itemCarbs,
    itemFat: dto.itemFat,
  }
}

export function mapMealDto(dto: MealResponseDto): Meal {
  return {
    id: dto.id,
    name: dto.name,
    loggedAt: dto.loggedAt,
    mealItems: dto.items.map(mapMealItemDto),
    totalCalories: dto.totalCalories,
    totalProtein: dto.totalProtein,
    totalCarbs: dto.totalCarbs,
    totalFat: dto.totalFat,
  }
}
