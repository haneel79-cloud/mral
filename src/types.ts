export interface MealNutrition {
  protein: number;       // in grams (e.g., 32)
  carbs: number;         // in grams (e.g., 110)
  fat: number;           // in grams (e.g., 25)
}

export interface MealItem {
  id: string;
  schoolName: "씨마스고등학교";
  date: string;          // e.g. "5월 18일"
  dateKey: string;       // e.g. "20260518" (YYYYMMDD)
  dayOfWeek: "월" | "화" | "수" | "목" | "금";
  mealType: "중식" | "석식";
  title: string;
  dishes: string[];
  totalCalories: number; // in kcal
  nutrition: MealNutrition;
  allergens: string[];
  timeRange: string;     // e.g. "12:30 ~ 13:30"
  imageUrl: string;
  proteinGoalPct: number; // e.g., 85 (%)
  isRecommended?: boolean;
}

export interface AllergyProfile {
  name: string;
  enabled: boolean;
}
