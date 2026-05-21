import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getTodayKST, 
  getKoreanDayOfWeek, 
  formatKoreanDate, 
  formatDateKey, 
  getWeekDates, 
  getWeekOfMonth, 
  getDefaultSelectedDate 
} from "./utils";
import { 
  getMockMealsForWeek, 
  CALCULATOR_ITEMS, 
  STUDENT_PORTRAIT_URL,
  IMAGE_CHEESE_DONKATSU,
  IMAGE_TUNA_MAYO,
  CalculatorFoodItem
} from "./data";
import { MealItem, AllergyProfile } from "./types";

export default function App() {
  // 1. Core Date Management using KST (Asia/Seoul)
  const today = getTodayKST(); 
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const defaultSelectedDate = getDefaultSelectedDate(today);

  // Active weekly dates (Monday to Friday) of the current week
  const currentWeekDates = getWeekDates(today);
  const weeklyMeals = getMockMealsForWeek(currentWeekDates);

  // Selected date in Calendar/Home context (defaults to closest weekday)
  const [selectedDate, setSelectedDate] = useState<Date>(defaultSelectedDate);
  const selectedDateKey = formatDateKey(selectedDate);

  // Active Bottom Navigation Tab
  // "home" | "schedule" | "calc" | "profile"
  const [activeTab, setActiveTab] = useState<"home" | "schedule" | "calc" | "profile">("home");

  // 2. Interactive States
  // Nutrition Calculator checked items list
  const [selectedCalcItemIds, setSelectedCalcItemIds] = useState<string[]>([]);
  // Calculator category filter
  const [calcFilter, setCalcFilter] = useState<string>("전체");
  
  // Modals & Alerts state
  const [showSupporterModal, setShowSupporterModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [heroDetailOpen, setHeroDetailOpen] = useState(false);

  // Profile preferences
  const [isAlertEnabled, setIsAlertEnabled] = useState(true);
  const [allergies, setAllergies] = useState<AllergyProfile[]>([
    { name: "우유", enabled: true },
    { name: "땅콩", enabled: true },
    { name: "대두", enabled: false },
    { name: "밀", enabled: false },
    { name: "쇠고기", enabled: false },
    { name: "돼지고기", enabled: false },
  ]);

  // Feedbacks or profile edits
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [profileName, setProfileName] = useState("김학생");
  const [profileClassInfo, setProfileClassInfo] = useState("2학년 3반 15번");

  // 3. Pre-populate Calculator based on today's lunch menu (Fulfilling Req #4)
  useEffect(() => {
    // Standard initialization: find the lunch menu for the currently selected date in the calculator.
    // If it possesses elements like Cheese Donkatsu or Hamburger steak, select those by default!
    const activeMeals = weeklyMeals.filter(m => m.dateKey === selectedDateKey && m.mealType === "중식");
    if (activeMeals.length > 0) {
      const activeLunch = activeMeals[0];
      const initialSelection: string[] = [];
      
      // Auto-prepopulate: match our items
      CALCULATOR_ITEMS.forEach(item => {
        // If calculator item shares part of the name with a dish in the current lunch, check it!
        const matchesDish = activeLunch.dishes.some(dishName => 
          dishName.replace(/\s+/g, "").includes(item.name.substring(0, 3)) || 
          item.name.replace(/\s+/g, "").includes(dishName.substring(0, 3))
        );
        // Default fallbacks for rice and soup
        if (matchesDish || 
            (item.name === "현미밥" && activeLunch.dishes.some(d => d.includes("밥"))) ||
            (item.name === "돼지고기 김치찌개" && activeLunch.dishes.some(d => d.includes("찌개") || d.includes("국")))
        ) {
          initialSelection.push(item.id);
        }
      });

      // If nothing matches, fall back to checking standard items (Rice & Stew)
      if (initialSelection.length === 0) {
        initialSelection.push("calc-1", "calc-2");
      }
      setSelectedCalcItemIds(initialSelection);
    } else {
      // General fallback
      setSelectedCalcItemIds(["calc-1", "calc-2"]);
    }
  }, [selectedDateKey]);

  // Helper selectors
  const getMealsForSelectedDate = () => {
    return weeklyMeals.filter(m => m.dateKey === selectedDateKey);
  };

  const getDayMeals = (dateKey: string) => {
    return weeklyMeals.filter(m => m.dateKey === dateKey);
  };

  // 4. Weekend Handling logic (Requirement #6 - Way B)
  // "다음 급식일인 월요일 식단을 자동으로 보여 주고, '다음 급식일' 배지를 표시해 주세요. 단, 화면이 비어 보이지 않도록 히어로 카드와 메뉴 카드는 유지해 주세요."
  const showNextMealBadge = isWeekend; // Mark badge if executed during Saturday or Sunday

  // Recommended Hero Meal Selector
  // Typically, let's look for recommended item (marked with isRecommended) inside today's list.
  // If today is a weekend, we display next Monday's recommendation.
  const getHeroMeal = (): MealItem => {
    // Find designated recommended lunch
    let hero = weeklyMeals.find(m => m.dateKey === selectedDateKey && m.mealType === "중식" && m.isRecommended);
    if (!hero) {
      // Fallback: any lunch for the selected date
      hero = weeklyMeals.find(m => m.dateKey === selectedDateKey && m.mealType === "중식");
    }
    if (!hero) {
      // Fallback: the first recommended item of the week (guarantees a pristine display)
      hero = weeklyMeals.find(m => m.mealType === "중식" && m.isRecommended) || weeklyMeals[0];
    }
    return hero;
  };

  const heroMeal = getHeroMeal();

  // Dynamic values based on selected calculator items
  const calculatorSum = CALCULATOR_ITEMS.filter(item => selectedCalcItemIds.includes(item.id))
    .reduce((totals, item) => ({
      calories: totals.calories + item.calories,
      protein: totals.protein + item.nutrition.protein,
      carbs: totals.carbs + item.nutrition.carbs,
      fat: totals.fat + item.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Standard recommended values/goals for secondary indicators
  const proteinGoal = 50; // g
  const carbsGoal = 200;  // g
  const fatGoal = 65;     // g
  const dailyTotalCaloriesLimit = 2300; // Average guideline

  // Toggle calculator checkbox
  const toggleCalculatorFood = (id: string) => {
    if (selectedCalcItemIds.includes(id)) {
      setSelectedCalcItemIds(selectedCalcItemIds.filter(itemId => itemId !== id));
    } else {
      setSelectedCalcItemIds([...selectedCalcItemIds, id]);
    }
  };

  // Helper trigger for toast alerts
  const showToastWithMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Toggle profile allergies
  const toggleAllergy = (index: number) => {
    const updated = [...allergies];
    updated[index].enabled = !updated[index].enabled;
    setAllergies(updated);
    showToastWithMsg(`알레르기 필터가 수정되었습니다: ${updated[index].name} (${updated[index].enabled ? "활성화" : "비활성화"})`);
  };

  // Dynamic Comment Generator for Bento boxes based on active day
  const getDietitianComment = (day: string) => {
    switch (day) {
      case "월": return { comment: "단백질 든든! 성장에 참 좋아요", icon: "emoji_objects" };
      case "화": return { comment: "철분이 가득가득! 빈혈 예방 완!", icon: "star" };
      case "수": return { comment: "신선 야채 비타민C, 면역력 무적!", icon: "health_and_safety" };
      case "목": return { comment: "모짜렐라 치즈 가득 칼슘 보충!", icon: "favorite" };
      case "금": return { comment: "몸에 유익한 식이섬유 한마당!", icon: "thumb_up" };
      default: return { comment: "균형 잡힌 맞춤 영양 식단입니다!", icon: "spa" };
    }
  };

  const activeDayComment = getDietitianComment(selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? "월" : getKoreanDayOfWeek(selectedDate));

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background text-on-surface flex flex-col relative pb-28 shadow-xl">
      {/* 5. GUEST NOTIFICATION BAR or HEADER */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-surface-container/50">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[28px] font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
          <h1 className="font-sans font-bold text-headline-md text-on-background tracking-tight">씨마스고등학교 급식</h1>
        </div>
        
        {/* Quick notification bubble based on alert flag state */}
        <button 
          onClick={() => {
            showToastWithMsg(isAlertEnabled ? "🔔 일일 식단 알림 기능이 켜져 있습니다." : "🔕 급식 알림이 현재 꺼져 있습니다. 프로필에서 설정할 수 있습니다.");
          }}
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[24px]">notifications</span>
          {isAlertEnabled && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-background ring-offset-0 animate-ping" />
          )}
        </button>
      </header>

      {/* Main View Container with Fluid Transitions */}
      <main className="px-margin-mobile pt-4 space-y-6">
        
        {/* ==================== VIEW 1: HOME TAB ==================== */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Upper Badge & Hero Card Display */}
            <section className="relative w-full h-[320px] rounded-lg overflow-hidden shadow-lg shadow-primary/5 group border border-transparent hover:border-primary/15 transition-all duration-300">
              {/* Hotlinked food image */}
              <img 
                src={heroMeal.imageUrl} 
                alt={heroMeal.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Bottom gradient mask for typography readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Dynamic Badging for recommendations / weekend indicators */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-on-primary font-sans font-bold text-label-sm px-4 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                  오늘의 추천 급식
                </span>
                
                {showNextMealBadge && (
                  <span className="bg-secondary-container text-on-secondary-container font-sans font-bold text-label-sm px-4 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    다음 급식일 (월)
                  </span>
                )}
              </div>

              {/* Text labels at the bottom */}
              <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                <p className="font-sans font-medium text-label-md text-white/95 tracking-wide mb-1 opacity-90">
                  {formatKoreanDate(selectedDate)}
                </p>
                
                <div className="flex justify-between items-end gap-3">
                  <div>
                    <h2 className="font-sans font-bold text-[24px] tracking-tight leading-tight">{heroMeal.title}</h2>
                    <div className="flex items-center gap-1.5 mt-2.5 text-white/90">
                      <span className="material-symbols-outlined text-[18px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                      <span className="font-sans font-bold text-label-md text-secondary-container">{heroMeal.totalCalories} kcal</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setHeroDetailOpen(true)}
                    className="bg-white text-primary px-5 py-2.5 rounded-full font-sans font-bold text-label-md shadow-md hover:bg-surface-container-high active:scale-95 transition-all duration-200 shrink-0"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            </section>

            {/* 오늘의 급식 요약 Header */}
            <section className="space-y-1.5">
              <h3 className="font-sans font-bold text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
                오늘의 급식 요약
              </h3>
              <p className="font-sans font-medium text-label-md text-on-surface-variant">씨마스고등학교의 정성 가득 담긴 균형 식단입니다.</p>
            </section>

            {/* Main Meals (Lunch / Dinner Bento List) */}
            <section className="grid grid-cols-1 gap-5">
              {getMealsForSelectedDate().map(meal => {
                const isLunch = meal.mealType === "중식";
                return (
                  <div 
                    key={meal.id}
                    className="bg-surface-container-lowest p-card-padding rounded-lg shadow-sm border border-surface-container/60 hover:border-primary/20 transition-all flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isLunch ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-container text-on-tertiary-container"
                        }`}>
                          <span className="material-symbols-outlined text-[24px]">
                            {isLunch ? "sunny" : "bedtime"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-headline-md">{meal.mealType}</span>
                            <span className="text-outline text-label-sm font-semibold">{meal.timeRange}</span>
                          </div>
                          <span className="text-primary font-sans font-bold text-label-sm">{meal.totalCalories} kcal</span>
                        </div>
                      </div>
                      
                      {/* Interactive menu toggle indicator */}
                      <button 
                        onClick={() => {
                          showToastWithMsg(`${meal.mealType} 은(는) 필수 단백질 권장량의 ${meal.proteinGoalPct}%를 충족합니다.`);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">info</span>
                      </button>
                    </div>

                    {/* Food dishes item bullet block */}
                    <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container/40">
                      <ul className="grid grid-cols-1 gap-2.5">
                        {meal.dishes.map((dish, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-body-md font-sans text-on-surface-variant">
                            <span className={`w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 ${isLunch ? "bg-primary" : "bg-tertiary"}`} />
                            <span className={idx === 2 || dish.includes("치즈") || dish.includes("함박") || dish.includes("마요") ? "text-primary font-bold" : ""}>
                              {dish}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Allergic ingredients hashtags */}
                    <div className="flex flex-wrap gap-1.5">
                      {meal.allergens.map((allergy, aIdx) => {
                        const isMatch = allergies.some(a => a.name === allergy && a.enabled);
                        return (
                          <span 
                            key={aIdx} 
                            className={`px-3 py-1 text-label-sm font-semibold rounded-full border ${
                              isMatch 
                                ? "bg-error-container text-on-error-container border-error/20 font-bold" 
                                : "bg-surface-container-highest text-on-surface-variant border-transparent"
                            }`}
                          >
                            #{allergy} {isMatch && "⚠️"}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Extra Progress Meter section */}
            <section className="bg-secondary-container/30 p-card-padding rounded-lg border border-secondary-container/40 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-label-md text-on-secondary-container">일일 권장 칼로리 달성도</span>
                <span className="font-sans font-bold text-headline-md text-primary">68%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: "68%" }} 
                />
              </div>
              <p className="font-sans font-medium text-label-sm text-outline leading-snug">
                오늘 급식을 모두 알차게 섭취할 경우 하루 전체 권장 에너지의 약 1,565 kcal를 균형있게 섭취하게 됩니다.
              </p>
            </section>
          </motion.div>
        )}


        {/* ==================== VIEW 2: WEEKLY SCHEDULE TAB ==================== */}
        {activeTab === "schedule" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Weekly Header Display */}
            <section className="flex justify-between items-end">
              <div>
                <span className="text-primary font-sans font-bold text-label-md">주간 식단표</span>
                <h2 className="font-sans font-bold text-headline-lg-mobile text-on-background mt-1 leading-none">
                  {getWeekOfMonth(selectedDate)}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setSelectedDate(defaultSelectedDate);
                  showToastWithMsg("오늘 날짜 주간으로 복귀하였습니다.");
                }}
                className="bg-surface-container-high p-3 rounded-2xl flex items-center justify-center hover:bg-surface-container-highest transition-colors active:scale-95 duration-150 shadow-sm"
              >
                <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
              </button>
            </section>

            {/* Horizontal weekday pill selector (Fully Dynamic) */}
            <section className="flex gap-2 bg-surface-container-low p-2 rounded-2xl border border-surface-container/60 overflow-x-auto no-scrollbar">
              {currentWeekDates.map((dateObj, idx) => {
                const dayLabel = getKoreanDayOfWeek(dateObj);
                const dayNum = dateObj.getDate();
                const isSelected = dateObj.getDate() === selectedDate.getDate() && dateObj.getMonth() === selectedDate.getMonth();
                const isRealToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`flex-1 min-w-[64px] h-24 flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-105" 
                        : "bg-surface-container-lowest hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span className={`text-label-sm font-semibold tracking-wider ${
                      isSelected ? "text-white/80" : "text-outline"
                    }`}>
                      {dayLabel} {isRealToday && "•"}
                    </span>
                    <span className="text-[20px] font-sans font-bold mt-1">
                      {dayNum}
                    </span>
                    {isRealToday && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 hidden xs:block ${
                        isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      }`}>
                        오늘
                      </span>
                    )}
                  </button>
                );
              })}
            </section>

            {/* Dynamic Meal List Display */}
            <section className="space-y-5">
              {getMealsForSelectedDate().length === 0 ? (
                <div className="bg-surface-container-lowest p-8 rounded-lg text-center border border-surface-container/80 space-y-3">
                  <span className="material-symbols-outlined text-outline text-[48px]">no_meals</span>
                  <p className="font-sans font-bold text-headline-md text-on-surface-variant">표시할 급식이 없습니다.</p>
                  <p className="font-sans font-medium text-label-sm text-outline">해당 일자의 식단 데이터를 확보 중입니다.</p>
                </div>
              ) : (
                getMealsForSelectedDate().map(meal => {
                  const isLunch = meal.mealType === "중식";
                  return (
                    <div 
                      key={meal.id}
                      className="bg-surface-container-lowest rounded-lg p-card-padding border border-surface-container/60 shadow-sm space-y-4"
                    >
                      {/* Top headers */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-3py-1 text-label-md font-bold px-3 py-1 rounded-full ${
                            isLunch ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-fixed text-on-tertiary"
                          }`}>
                            {meal.mealType}
                          </span>
                          <span className="text-on-surface-variant font-sans font-medium text-label-md">{meal.timeRange}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-primary font-sans font-bold text-headline-md">{meal.totalCalories}</span>
                          <span className="text-outline text-label-sm font-bold ml-0.5">kcal</span>
                        </div>
                      </div>

                      {/* Asymmetric layout with small dish indicators & hotlinks image */}
                      <div className="flex gap-4 items-center">
                        <img 
                          src={isLunch ? IMAGE_CHEESE_DONKATSU : IMAGE_TUNA_MAYO}
                          alt={meal.title}
                          className="w-24 h-24 rounded-2xl object-cover bg-surface-container border border-surface-container"
                          referrerPolicy="no-referrer"
                        />
                        <ul className="flex-1 space-y-1">
                          {meal.dishes.map((dish, dIdx) => (
                            <li 
                              key={dIdx} 
                              className={`font-sans text-body-md ${
                                dIdx === 2 || dish.includes("치즈") || dish.includes("함박") || dish.includes("마요")
                                  ? "text-primary font-bold" 
                                  : "text-on-surface"
                              }`}
                            >
                              {dish}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Requirement #3 gauge and detailed source list flags */}
                      <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container/40 space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className="text-label-md font-sans font-semibold text-on-surface-variant">단백질 달성률</span>
                          <span className="text-label-md font-sans font-bold text-primary">{meal.proteinGoalPct}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${meal.proteinGoalPct}%` }}
                          />
                        </div>

                        {/* Local raw material indicators */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="bg-surface-container-highest text-on-surface-variant px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold border border-surface-container-high">돼지고기(국산)</span>
                          <span className="bg-surface-container-highest text-on-surface-variant px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold border border-surface-container-high">배추(국산)</span>
                          <span className="bg-[#FFE7DD] text-primary px-2.5 py-1 rounded-md text-[11px] font-sans font-bold">콘드레싱</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Bento Banner bottom items with active allergen data */}
            <section className="grid grid-cols-2 gap-3 pb-4">
              <div className="bg-secondary-container/30 p-4 rounded-2xl border border-secondary-container/50 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary text-[24px] mb-1">info</span>
                  <p className="text-label-sm font-sans font-bold text-secondary">오늘의 알레르기</p>
                </div>
                <p className="text-body-md font-sans font-bold text-on-secondary-container mt-1.5">
                  {getMealsForSelectedDate().length > 0 
                    ? getMealsForSelectedDate()[0].allergens.slice(0, 3).join(", ") 
                    : "대두, 밀, 우유"}
                </p>
              </div>

              <div className="bg-primary-container/80 p-4 rounded-2xl text-on-primary-container flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-on-primary-container text-[24px] mb-1">{activeDayComment.icon}</span>
                  <p className="text-label-sm font-sans font-bold text-on-primary-container/90">영양사 코멘트</p>
                </div>
                <p className="text-body-md font-sans font-bold mt-1.5 leading-tight">
                  {activeDayComment.comment}
                </p>
              </div>
            </section>
          </motion.div>
        )}


        {/* ==================== VIEW 3: NUTRITION CALCULATOR TAB ==================== */}
        {activeTab === "calc" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Dynamic Nutrients Summary Header card */}
            <section className="bg-surface-container-lowest rounded-lg p-card-padding shadow-sm border border-surface-container">
              <div className="flex justify-between items-center mb-4 border-b border-surface-container-low pb-3">
                <h2 className="font-sans font-bold text-headline-md text-on-surface">오늘의 선택 영양</h2>
                <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  <span className="font-sans font-bold text-label-md">{calculatorSum.calories} kcal</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Protein Indicator bar */}
                <div className="space-y-2">
                  <div className="flex justify-between font-sans text-label-md">
                    <span className="text-on-surface-variant font-medium">단백질</span>
                    <span className="text-primary font-bold">{calculatorSum.protein}g / {proteinGoal}g</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-surface-container">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (calculatorSum.protein / proteinGoal) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-2">
                  <div className="flex justify-between font-sans text-label-md">
                    <span className="text-on-surface-variant font-medium">탄수화물</span>
                    <span className="text-primary font-bold">{calculatorSum.carbs}g / {carbsGoal}g</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-surface-container">
                    <div 
                      className="h-full bg-primary/80 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (calculatorSum.carbs / carbsGoal) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Fat */}
                <div className="space-y-2">
                  <div className="flex justify-between font-sans text-label-md">
                    <span className="text-on-surface-variant font-medium">지방</span>
                    <span className="text-primary font-bold">{calculatorSum.fat}g / {fatGoal}g</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-surface-container">
                    <div 
                      className="h-full bg-primary/60 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (calculatorSum.fat / fatGoal) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Category Filter Pills scrollable bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {["전체", "밥류", "국/찌개", "반찬", "디저트"].map((category) => {
                const isActive = calcFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setCalcFilter(category)}
                    className={`flex-shrink-0 px-4.5 py-2 rounded-full font-sans font-bold text-label-md transition-all duration-150 border cursor-pointer ${
                      isActive 
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Menu checklist items lists */}
            <section className="grid grid-cols-1 gap-3 pb-3">
              {CALCULATOR_ITEMS
                .filter(item => calcFilter === "전체" || item.category === calcFilter)
                .map((item) => {
                  const isChecked = selectedCalcItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCalculatorFood(item.id)}
                      className={`group relative p-card-padding rounded-lg bg-surface-container-lowest border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                        isChecked 
                          ? "border-primary shadow-md scale-[1.01]" 
                          : "border-surface-container/80 hover:border-primary/20"
                      }`}
                    >
                      {/* Check mark status identifier absolute corner */}
                      <div className={`absolute top-3 right-3 transition-colors ${isChecked ? "text-primary" : "text-outline-variant"}`}>
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: ` 'FILL' ${isChecked ? 1 : 0}` }}>
                          {isChecked ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className={`w-16 h-16 rounded-2xl object-cover shadow-sm bg-surface-container-low transition-all ${
                            isChecked ? "" : "grayscale-[20%]"
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-sans font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full border border-surface-container-highest">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="font-sans font-bold text-headline-md tracking-tight text-on-surface mt-1 text-sm leading-tight">
                            {item.name}
                          </h3>
                          <div className="flex gap-2.5 mt-1.5 font-sans font-semibold text-label-sm">
                            <span className="text-primary">{item.calories} kcal</span>
                            <span className="text-outline">탄 {item.nutrition.carbs}g • 단 {item.nutrition.protein}g • 지 {item.nutrition.fat}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </section>

            {/* Bottom calculation save actions button */}
            <div className="pt-2 pb-4">
              <button 
                onClick={() => {
                  showToastWithMsg("💾 오늘의 식사 계산 내역이 든든하게 저장되었습니다!");
                }}
                className="w-full bg-primary-container text-on-primary-container hover:bg-primary py-5 rounded-full font-sans font-bold text-headline-md shadow-lg active:scale-95 transition-all duration-200 cursor-pointer flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                계산 결과 저장하기
              </button>
            </div>
          </motion.div>
        )}


        {/* ==================== VIEW 4: STUDENT PROFILE TAB ==================== */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6 pb-6"
          >
            {/* Student visual layout Card */}
            <section className="relative overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm p-card-padding border border-surface-container/60">
              {/* Corner branding accent layout decorator */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-surface shadow-md overflow-hidden bg-surface-container-high shrink-0">
                    <img 
                      src={STUDENT_PORTRAIT_URL} 
                      alt="Student Headshot" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Portrait editor toggler button */}
                  <button 
                    onClick={() => {
                      if (isEditingProfileName) {
                        setIsEditingProfileName(false);
                        showToastWithMsg("프로필 저장이 완벽하게 완료되었습니다.");
                      } else {
                        setIsEditingProfileName(true);
                      }
                    }}
                    className="absolute bottom-0 right-0 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isEditingProfileName ? "check" : "edit"}
                    </span>
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  {isEditingProfileName ? (
                    <div className="space-y-1.5 py-1">
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-background border border-primary/30 rounded px-2.5 py-1 text-sm font-sans font-bold"
                        placeholder="이름"
                      />
                      <input 
                        type="text" 
                        value={profileClassInfo}
                        onChange={(e) => setProfileClassInfo(e.target.value)}
                        className="w-full bg-background border border-primary/30 rounded px-2.5 py-1 text-xs text-outline font-semibold"
                        placeholder="학반 정보"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="font-sans font-bold text-headline-md text-on-background">{profileName}</h2>
                      <p className="font-sans font-semibold text-body-md text-outline">{profileClassInfo}</p>
                    </>
                  )}

                  <div className="flex gap-2.5 pt-1.5">
                    <span className="px-3 py-0.5 bg-secondary-container text-on-secondary-container text-label-sm font-bold rounded-full">학생회</span>
                    <span className="px-3 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm font-bold rounded-full">동아리 기장</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Notification controls category */}
            <section className="space-y-3.5">
              <h3 className="font-sans font-bold text-label-md text-outline tracking-wide uppercase px-2">알림 설정</h3>
              <div className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container/60 space-y-1 shadow-sm">
                
                {/* Allergy alerts settings */}
                <div className="p-3 hover:bg-surface-container-low rounded-lg transition-colors flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-body-lg text-on-surface">알레르기 경고 알림</span>
                      <p className="text-[11px] text-outline font-medium mt-0.5">선택된 유발 물질이 식단에 포함되면 표시합니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={allergies.some(a => a.enabled)}
                        onChange={() => {
                          const anyOn = allergies.some(a => a.enabled);
                          setAllergies(allergies.map(a => ({ ...a, enabled: !anyOn })));
                          showToastWithMsg(anyOn ? "알레르기 감지 기능이 전체 해제되었습니다." : "알레르기 경고 감지 기능이 전체 활성화되었습니다.");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Individual active allergy chips toggle switches */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {allergies.map((allergy, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => toggleAllergy(aIdx)}
                        className={`px-3 py-1.5 rounded-full text-label-sm font-bold border transition-colors cursor-pointer ${
                          allergy.enabled 
                            ? "bg-[#FFE7DD] text-error border-error/20" 
                            : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border-transparent"
                        }`}
                      >
                        {allergy.name} {allergy.enabled ? "✓" : "+"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch list item 2 */}
                <div className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-lg transition-colors">
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-body-lg text-on-surface">일일 식단 알림</span>
                    <p className="text-[11px] text-outline font-medium mt-0.5">매일 아침 8시에 오늘의 간편 급식을 요약해 드립니다.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isAlertEnabled}
                      onChange={() => {
                        setIsAlertEnabled(!isAlertEnabled);
                        showToastWithMsg(!isAlertEnabled ? "일일 급식 오전 배달 알림이 켜졌습니다." : "오전 단독 긴급 알림이 해제되었습니다.");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Service guide categories links */}
            <section className="space-y-3.5">
              <h3 className="font-sans font-bold text-label-md text-outline tracking-wide uppercase px-2">서비스 안내</h3>
              <div className="bg-surface-container-lowest rounded-lg p-2 border border-surface-container/60 space-y-1 shadow-sm">
                
                {/* Link item 1: customer helpdesk */}
                <button 
                  onClick={() => setShowSupporterModal(true)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">support_agent</span>
                    </div>
                    <span className="font-sans font-bold text-body-lg text-on-surface">영양 교무실 고객센터</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-0.5 transition-transform" data-icon="chevron_right">chevron_right</span>
                </button>

                {/* Link item 2: terms policies */}
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <span className="font-sans font-bold text-body-lg text-on-surface">급식 서비스 이용약관</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-0.5 transition-transform" data-icon="chevron_right">chevron_right</span>
                </button>

                {/* Link item 3: signout / exit */}
                <button 
                  onClick={() => {
                    showToastWithMsg("식당 퇴실 및 로그아웃이 정상적으로 처리되었습니다.");
                    setProfileName("비회원 학생");
                    setProfileClassInfo("외부 손님");
                  }}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface-container-low rounded-lg transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                    </div>
                    <span className="font-sans font-bold text-body-lg text-error">서비스 로그아웃</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-error/50">logout</span>
                </button>
              </div>
            </section>

            {/* Custom Footer */}
            <footer className="py-6 flex flex-col items-center justify-center text-center space-y-1">
              <p className="font-sans font-bold text-label-sm text-outline">© 2026 씨마스고등학교 급식</p>
              <p className="font-sans font-medium text-label-sm text-outline-variant/80">건강하고 스마트한 학교 급식정보 서비스를 제공합니다.</p>
            </footer>
          </motion.div>
        )}
      </main>

      {/* ==================== BOTTOM PERSISTENT NAVIGATION BAR ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 flex justify-around items-center px-4 bg-surface-container-lowest border-t border-surface-container-high shadow-lg rounded-t-2xl h-22">
        
        {/* Nav 1: 홈 */}
        <button 
          onClick={() => setActiveTab("home")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === "home" 
              ? "bg-primary text-on-primary shadow-md scale-105" 
              : "text-outline hover:text-primary"
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]" 
            style={{ fontVariationSettings: ` 'FILL' ${activeTab === "home" ? 1 : 0}` }}
          >
            home
          </span>
          <span className="font-sans font-bold text-label-sm mt-1">홈</span>
        </button>

        {/* Nav 2: 식단표 */}
        <button 
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === "schedule" 
              ? "bg-primary text-on-primary shadow-md scale-105" 
              : "text-outline hover:text-primary"
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]" 
            style={{ fontVariationSettings: ` 'FILL' ${activeTab === "schedule" ? 1 : 0}` }}
          >
            calendar_month
          </span>
          <span className="font-sans font-bold text-label-sm mt-1">식단표</span>
        </button>

        {/* Nav 3: 영양계산 */}
        <button 
          onClick={() => setActiveTab("calc")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === "calc" 
              ? "bg-primary text-on-primary shadow-md scale-105" 
              : "text-outline hover:text-primary"
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]" 
            style={{ fontVariationSettings: ` 'FILL' ${activeTab === "calc" ? 1 : 0}` }}
          >
            calculate
          </span>
          <span className="font-sans font-bold text-label-sm mt-1">영양계산</span>
        </button>

        {/* Nav 4: 프로필 */}
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === "profile" 
              ? "bg-primary text-on-primary shadow-md scale-105" 
              : "text-outline hover:text-primary"
          }`}
        >
          <span 
            className="material-symbols-outlined text-[24px]" 
            style={{ fontVariationSettings: ` 'FILL' ${activeTab === "profile" ? 1 : 0}` }}
          >
            person
          </span>
          <span className="font-sans font-bold text-label-sm mt-1">프로필</span>
        </button>
      </nav>

      {/* ==================== MODALS & BANNER NOTIFICATIONS ==================== */}
      
      {/* 1. Detail Meal Modal for 추천 급식 Card */}
      <AnimatePresence>
        {heroDetailOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-surface-container-lowest max-w-sm w-full p-6 rounded-lg border border-surface-container shadow-xl overflow-hidden relative"
            >
              <h3 className="font-sans font-bold text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">restaurant_menu</span>
                {heroMeal.title} 상세보기
              </h3>
              
              <div className="mt-4 space-y-4">
                <img 
                  src={heroMeal.imageUrl}
                  alt={heroMeal.title}
                  className="w-full h-40 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-label-md text-primary">영양 함량 가이드</h4>
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-xl text-center border border-surface-container/60">
                    <div>
                      <span className="text-[11px] text-outline font-semibold">탄수화물</span>
                      <p className="text-sm font-sans font-bold text-on-surface mt-0.5">{heroMeal.nutrition.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-outline font-semibold">단백질</span>
                      <p className="text-sm font-sans font-bold text-on-surface mt-0.5">{heroMeal.nutrition.protein}g</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-outline font-semibold">지방</span>
                      <p className="text-sm font-sans font-bold text-on-surface mt-0.5">{heroMeal.nutrition.fat}g</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-label-md text-primary">전체 식단 리스트</h4>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container/40">
                    <ul className="grid grid-cols-2 gap-2 text-xs font-sans font-semibold text-on-surface-variant">
                      {heroMeal.dishes.map((dish, dIdx) => (
                        <li key={dIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {dish}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-label-md text-primary">알레르기 경고 물질</h4>
                  <p className="text-xs text-outline leading-relaxed">
                    본 식단은 <span className="font-bold text-error">{heroMeal.allergens.join(", ")}</span> 성분이 들어 있으므로 해당 식품군에 과민 반응이 있는 학생은 주의하시기 바랍니다.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setHeroDetailOpen(false)}
                  className="w-full bg-primary text-on-primary py-3.5 rounded-full font-sans font-bold text-label-md hover:bg-primary-container hover:text-on-primary-container Transition-colors active:scale-95 duration-150 cursor-pointer"
                >
                  확인하고 닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Customer Support Helpdesk Modal */}
      <AnimatePresence>
        {showSupporterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest max-w-sm w-full p-6 rounded-lg border border-surface-container shadow-xl text-center space-y-4"
            >
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>support_agent</span>
              <h3 className="font-sans font-bold text-headline-md text-on-surface">영양 교무실 고객센터</h3>
              
              <div className="bg-surface-container-low p-4 rounded-xl text-left font-sans font-medium text-label-md text-on-surface-variant space-y-2">
                <p>📍 <strong>위치</strong>: 본교 본관 1층 서편 영양 상담 교무실</p>
                <p>📞 <strong>내선 연락처</strong>: 02-345-6789 (영양교사실)</p>
                <p>⏰ <strong>상담 시간</strong>: 오전 9시 - 오후 4시 (점심시간 제외)</p>
                <p className="text-xs text-outline leading-snug pt-2">
                  본교 학생의 맞춤형 식단 조절, 영양 관리, 질환 관리식 등 세심한 건강 상담이 언제든지 준비되어 있습니다.
                </p>
              </div>

              <button 
                onClick={() => setShowSupporterModal(false)}
                className="w-full bg-primary text-on-primary py-3 rounded-full font-sans font-bold text-label-md active:scale-95 transition-all duration-150 cursor-pointer"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Service Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest max-w-sm w-full p-6 rounded-lg border border-surface-container shadow-xl space-y-4 text-left"
            >
              <h3 className="font-sans font-bold text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                급식 서비스 이용약관
              </h3>
              
              <div className="h-60 overflow-y-auto bg-surface-container-low p-4 rounded-xl font-sans text-xs text-on-surface-variant font-semibold leading-relaxed space-y-3 border border-surface-container">
                <p className="font-bold text-primary">제 1 조 (목적)</p>
                <p>본 약관은 씨마스고등학교가 학생들에게 최적의 급식 정보를 신속하게 전달하고자 구현한 애플리케이션의 사용 권리와 의무 사항을 규정합니다.</p>
                <p className="font-bold text-primary">제 2 조 (제공 서비스)</p>
                <p>어플리케이션은 매일 변경되는 중식 및 석식 정보 가이드, 알레르기 수치 경보, 맞춤형 영양소 계산, 기호도 평가 기능을 기본 무상 지원합니다.</p>
                <p className="font-bold text-primary">제 3 조 (알레르기 고지 정책)</p>
                <p>본 어플리케이션의 알레르기 감지 기능은 NEIS 식자재 데이터 기반 예비 안내 목적입니다. 중증 환우는 반드시 식단 투입 전 본교 보건실과 사전 이중 점검해야 합니다.</p>
              </div>

              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-primary text-on-primary py-3 rounded-full font-sans font-bold text-label-md active:scale-95 transition-all duration-150 cursor-pointer"
              >
                동의하고 닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Action Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <div className="fixed bottom-26 left-4 right-4 max-w-md mx-auto z-50 px-4">
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-lg font-sans font-bold text-xs tracking-tight flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px]">done_outline</span>
              <span>{toastMessage}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
