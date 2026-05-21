import { MealItem } from "./types";
import { formatDateKey, getKoreanDayOfWeek } from "./utils";

// Static hotlinked image URLs from the user's interface
export const IMAGE_CHEESE_DONKATSU = "https://lh3.googleusercontent.com/aida-public/AB6AXuBL4MFbTJopwrFd0sytzw7RRWEx0hfXlHnxpa7Typ-9_FmIad_fJ39e3fUuEbFYVMtckUBHZBo_ltADp55vh1DP1TRFyekRJ368vWpyRF6pKrUAYok4mImwu88quxKzRHlNGi1Avrli1ZeFYlffvL3ZGgluugecnh_Fw638EAofZQzKAtUWYDn-YL2_YflahpEqIRqFuF-g2gksS3o9XFWmfiH5UAVvFYN-XCp3-DFp-FIaX0nsFSTQ1-R-XRmcB4vOn5e1QDGOPg4";
export const IMAGE_HAMBURGER_STEAK = "https://lh3.googleusercontent.com/aida-public/AB6AXuD3M45cXrPtxRKrS4_CkNUoFUcGvBwtBWg8bWiHRM7vARFpOdLYlIYYBC13qm0cG_5-nNgG6fAwYaLtk6nLpWcyKwux1o60z0S_giFIhbrmNxbOatzc8uLR1jKn_Jyo54K8pstzKFyRdomdTT7wxT9QS2xc-e_L7afW6W743bUS4UqqLXjC3F_ahcA48udnA8bwnZt6nlJ88gF4JiOLnHg8qlPVsg5mqvTA1b2un74M2qZGlISDlmMWeLkEFBPl0dn-c1VPAT27zVY";
export const IMAGE_TUNA_MAYO = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1YzinWFtvTICQDQXXHce5gbvWSDD5DTWGouHz1rrXrFoVWBHKCysmxKaNLRHC120DqFjDGx9GwfSXAxCE4SFr4sLKAoBP6ZqzW_679yjw-yOqE6QEjWl-IIb-zA5lCRNU6d-98k-5RdXBYPbNM4OL0BB_uRyUjU1axUnogIv8vm17SjQVHIHwTGrD4UwVY8XV5oLOJVjkm-hWC44gAI49pKcZkwhs9-HTwxYfnbxRv1oHBbUAvS-wWhLSGNOCGyYajDhz_6qFOjs";

// Individual components for custom nutrition calculator selections
export const IMAGE_BROWN_RICE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBGPzww0nSr6NeY51G6Z-o7ToZNOWQcs7QEJAXyzUo2_QBbW4qsa7bcJImLj5HgpFvrDQZkiqIYRwXfn8Ong4yIvNRI1xt8qgeZ1z3CKr8zviavdZ0NgyANJQGrieon2qvaKoWutbx88Vjej__5WebauRMk_AzER8KmySpaQvvaoKUnL-7IYiDptSwjRRk8th7P3GGN5LBD3e4eeK-bbXqHI4h6cyTUVkY3rHd3Pp9zWJHSlTfyd1gtufO2oNjIqK15259jVDn4pTU";
export const IMAGE_KIMCHI_STEW = "https://lh3.googleusercontent.com/aida-public/AB6AXuBRfhYhqawa2ydymmSo4TAs4nO0lInA6qw6kCsD4uVU5tvHdBtys6WOxnWhgol_NE_mxoUSTOI1TQjPBkE98hagZpAZ506G31dTJwvnAogk-gFmimStKtJsLe5Z4KEXPro7KxcBnxoYX5B-YqOs-4Ay0jDC-cSgVmqrdmx33fxHKpTFqmo-u9wEYJenKODK12x3X-XGlhpFgpG78v0-VeHN2YcCZ86d9lcMp4ntS4pp70XJ3oj_-hmGsXVnAefCZQPpX3vBGj_YeeU";
export const IMAGE_SPINACH_NAMUL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBsf9Agb5nYksAKi9tAx5K8nAU-VpYhXLUIsE19pQx-55njAKyorU8dSkpgdcs0w0imc_VhZ-Gr8X4iGxBdCq84x9NlR_7H4Z51bh7A15CdPj2OaX0C1SwZlyeyEezVynZZvpK1DEfXDNlpAwCPBOqeCLdH5Feoxu-FyBZEeFeCZv9RuVlftpcgs0RVONzWJ-zi7Z2-ZFvEd7FnvmPoS5rtxIAQWh64Y8TwSD5LIGZIDrnV9WV2kT3t1diWoOcjJRSDkBWChlectwY";
export const IMAGE_MACKEREL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCfioRbRhNCd9T1aG2F8EvBE9S5msoOIBvorkBSq6G-qiiUloiRR7CgJxiB5UaxZ91qBZKzaPZfQGta33SCPiBzALsAFmhbrkuitUeDVil94Wem6EzutN2Uyy4iCLRsA7n2rv51ZaLDCOmyeT6GP9g-ooxrbt7HLLIquxXI0UCHHkGFQIACcN_IlyooQu5YXGaem-sXV6VDZIrMkNGiJadjNwKQ5DNFS4w_5pIK4B74kYWPBOClG_Lu0h9aL5bI6imP4iSzee8SOdU";

export const STUDENT_PORTRAIT_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBViNCbzoYxL3wA-tKFj7Wlxva9acN_fiuJBgT5ZrdgJUFdYhpXZNStb1v9dpG9SeIEYZ2TvWA5LRgkkt8zrZkkAw9bVik9syU38oT-PyHjDyaLkqyflv1e53h43ue8dnMW8tdLfCK_72iG7PmUqkzhIptq3X9S_BF0Y_IbqVXM8zbF4RzVFRx57G_OovamXYUoSuEb3jLIioxxsNHnpt7zOWpl3SCOk0rA4o78pHIlEeBU6-XhifrOKHdAIbwsrk5PvvAxJdsZpRI";

export interface CalculatorFoodItem {
  id: string;
  name: string;
  category: "밥류" | "국/찌개" | "반찬" | "디저트";
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl: string;
}

// Fixed food items for our nutrition calculator view
export const CALCULATOR_ITEMS: CalculatorFoodItem[] = [
  {
    id: "calc-1",
    name: "현미밥",
    category: "밥류",
    calories: 300,
    nutrition: { protein: 6, carbs: 65, fat: 1 },
    imageUrl: IMAGE_BROWN_RICE,
  },
  {
    id: "calc-2",
    name: "돼지고기 김치찌개",
    category: "국/찌개",
    calories: 250,
    nutrition: { protein: 14, carbs: 12, fat: 15 },
    imageUrl: IMAGE_KIMCHI_STEW,
  },
  {
    id: "calc-3",
    name: "시금치 나물",
    category: "반찬",
    calories: 45,
    nutrition: { protein: 3, carbs: 6, fat: 0.5 },
    imageUrl: IMAGE_SPINACH_NAMUL,
  },
  {
    id: "calc-4",
    name: "고등어 구이",
    category: "반찬",
    calories: 250,
    nutrition: { protein: 22, carbs: 0, fat: 17 },
    imageUrl: IMAGE_MACKEREL,
  },
  {
    id: "calc-5",
    name: "치즈돈까스 정식",
    category: "반찬",
    calories: 450,
    nutrition: { protein: 20, carbs: 32, fat: 28 },
    imageUrl: IMAGE_CHEESE_DONKATSU,
  },
  {
    id: "calc-6",
    name: "수제함박스테이크",
    category: "반찬",
    calories: 380,
    nutrition: { protein: 18, carbs: 15, fat: 22 },
    imageUrl: IMAGE_HAMBURGER_STEAK,
  },
  {
    id: "calc-7",
    name: "참치마요덮밥 배합밥",
    category: "밥류",
    calories: 320,
    nutrition: { protein: 9, carbs: 60, fat: 5 },
    imageUrl: IMAGE_TUNA_MAYO,
  },
  {
    id: "calc-8",
    name: "요구르트 디저트",
    category: "디저트",
    calories: 70,
    nutrition: { protein: 1.2, carbs: 15, fat: 0.5 },
    imageUrl: "https://images.unsplash.com/photo-1571244856341-4f3dd95db36e?auto=format&fit=crop&w=150&q=80",
  }
];

export function getMockMealsForWeek(weekDates: Date[]): MealItem[] {
  // weekDates is expected to be an array of exactly 5 Dates (Mon-Fri)
  const meals: MealItem[] = [];
  const days: ("월" | "화" | "수" | "목" | "금")[] = ["월", "화", "수", "목", "금"];

  weekDates.forEach((dateObj, idx) => {
    const dayName = days[idx] || "월";
    const dateKeyStr = formatDateKey(dateObj);
    const dateFormatted = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

    // 1. Monday
    if (idx === 0) {
      meals.push({
        id: `lunch-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "중식",
        title: "마파두부덮밥정식",
        dishes: ["마파두부덮밥", "맑은달걀파국", "꿔바로우 탕수육", "짜사이채무침", "요구르트 디저트"],
        totalCalories: 810,
        nutrition: { protein: 26, carbs: 115, fat: 18 },
        allergens: ["대두", "밀", "난류", "돼지고기"],
        timeRange: "12:30 ~ 13:30",
        imageUrl: IMAGE_HAMBURGER_STEAK,
        proteinGoalPct: 75,
      });
      meals.push({
        id: `dinner-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "석식",
        title: "해물볶음우동과 새우튀김",
        dishes: ["해물볶음간장우동", "스마일 감자튀김", "김말이 & 새우튀김", "단무지채무침", "짜먹는 요거트"],
        totalCalories: 780,
        nutrition: { protein: 24, carbs: 105, fat: 22 },
        allergens: ["밀", "대두", "메밀", "새우", "우유"],
        timeRange: "18:00 ~ 19:00",
        imageUrl: IMAGE_TUNA_MAYO,
        proteinGoalPct: 65,
      });
    }

    // 2. Tuesday
    if (idx === 1) {
      meals.push({
        id: `lunch-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "중식",
        title: "수제함박스테이크 정식",
        dishes: ["혼합잡곡밥", "돈육김치찌개", "수제함박스테이크", "숙주미나리무침", "깍두기"],
        totalCalories: 850,
        nutrition: { protein: 32, carbs: 110, fat: 25 },
        allergens: ["돼지고기", "배추(국산)", "대두", "밀"],
        timeRange: "12:30 ~ 13:30",
        imageUrl: IMAGE_HAMBURGER_STEAK,
        proteinGoalPct: 85,
      });
      meals.push({
        id: `dinner-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "석식",
        title: "데리야끼 치킨마요덮밥",
        dishes: ["치킨마요덮밥", "유부 우동국수", "매콤 기름떡볶이", "꼬들단무지", "샤인머스캣 에이드"],
        totalCalories: 760,
        nutrition: { protein: 28, carbs: 115, fat: 21 },
        allergens: ["대두", "밀", "닭고기", "우유", "난류"],
        timeRange: "18:00 ~ 19:00",
        imageUrl: IMAGE_TUNA_MAYO,
        proteinGoalPct: 70,
      });
    }

    // 3. Wednesday
    if (idx === 2) {
      meals.push({
        id: `lunch-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "중식",
        title: "전통비빔밥과 바싹불고기",
        dishes: ["친환경보리약밥", "맑은콩나물국", "약고추장 두부비빔밥", "언양식 바싹석쇠불고기", "배추겉절이"],
        totalCalories: 820,
        nutrition: { protein: 35, carbs: 105, fat: 16 },
        allergens: ["대두", "밀", "쇠고기", "배추(국산)"],
        timeRange: "12:30 ~ 13:30",
        imageUrl: IMAGE_HAMBURGER_STEAK,
        proteinGoalPct: 90,
      });
      meals.push({
        id: `dinner-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "석식",
        title: "추억의 스팸김치볶음밥",
        dishes: ["스팸김치볶음밥", "고소한 구이김", "대왕 계란말이", "가래떡 소시지꼬치", "초코에몽 우유"],
        totalCalories: 790,
        nutrition: { protein: 22, carbs: 110, fat: 24 },
        allergens: ["돼지고기", "난류", "대두", "밀", "우유"],
        timeRange: "18:00 ~ 19:00",
        imageUrl: IMAGE_TUNA_MAYO,
        proteinGoalPct: 60,
      });
    }

    // 4. Thursday
    if (idx === 3) {
      meals.push({
        id: `lunch-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "중식",
        title: "치즈돈까스 정식",
        dishes: ["친환경현미밥", "쇠고기미역국", "매콤돈육강정", "숙주미나리무침", "배추김치"],
        totalCalories: 845,
        nutrition: { protein: 32, carbs: 110, fat: 25 },
        allergens: ["대두", "밀", "쇠고기(국산)", "돼지고기(국산)", "배추(국산)"],
        timeRange: "12:30 ~ 13:30",
        imageUrl: IMAGE_CHEESE_DONKATSU,
        proteinGoalPct: 85,
        isRecommended: true,
      });
      meals.push({
        id: `dinner-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "석식",
        title: "참치마요덮밥 & 미니우동",
        dishes: ["참치마요덮밥", "미니 가쓰오우동", "단무지실파무침", "아삭 배추김치", "새콤 요구르트"],
        totalCalories: 720,
        nutrition: { protein: 30, carbs: 120, fat: 20 },
        allergens: ["난류", "우유", "대두", "밀", "생선"],
        timeRange: "18:00 ~ 19:00",
        imageUrl: IMAGE_TUNA_MAYO,
        proteinGoalPct: 60,
      });
    }

    // 5. Friday
    if (idx === 4) {
      meals.push({
        id: `lunch-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "중식",
        title: "진치국수와 눈꽃군만두",
        dishes: ["오색 잔치국수", "수제 양념장", "셀프 김가루 쾌속밥", "화끈 눈꽃군만두", "겉절이김치", "과일젤리"],
        totalCalories: 830,
        nutrition: { protein: 25, carbs: 125, fat: 17 },
        allergens: ["대두", "밀", "돼지고기(국산)", "난류"],
        timeRange: "12:30 ~ 13:30",
        imageUrl: IMAGE_HAMBURGER_STEAK,
        proteinGoalPct: 70,
      });
      meals.push({
        id: `dinner-${dateKeyStr}`,
        schoolName: "씨마스고등학교",
        date: dateFormatted,
        dateKey: dateKeyStr,
        dayOfWeek: dayName,
        mealType: "석식",
        title: "햄듬뿍 의정부 부대찌개",
        dishes: ["친환경 햅쌀밥", "얼큰 사골부대찌개", "담백 삼치구이", "감자채 들깨볶음", "석박지"],
        totalCalories: 750,
        nutrition: { protein: 27, carbs: 100, fat: 21 },
        allergens: ["대두", "밀", "돼지고기", "우유", "생선"],
        timeRange: "18:00 ~ 19:00",
        imageUrl: IMAGE_TUNA_MAYO,
        proteinGoalPct: 68,
      });
    }
  });

  return meals;
}
