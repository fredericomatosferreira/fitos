export function formatNumber(n, decimals = 1) {
  if (n == null || isNaN(n)) return '0'
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export function calcMacros(food, quantityG) {
  const factor = quantityG / 100
  return {
    calories: food.calories_per_100g * factor,
    protein: food.protein_per_100g * factor,
    carbs: food.carbs_per_100g * factor,
    fat: food.fat_per_100g * factor,
  }
}

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs',
  'Core', 'Full Body', 'Cardio'
]

export function mealTypeLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
