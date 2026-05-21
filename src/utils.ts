/**
 * Date Utility Functions for Asia/Seoul (KST)
 */

export function getTodayKST(): Date {
  const now = new Date();
  // Get UTC milliseconds
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Shift to KST (UTC+9) and return a new Date object representing local KST
  const kst = new Date(utc + (3600000 * 9));
  return kst;
}

export function getKoreanDayOfWeek(date: Date): "일" | "월" | "화" | "수" | "목" | "금" | "토" {
  const days: ("일" | "월" | "화" | "수" | "목" | "금" | "토")[] = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
}

export function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = getKoreanDayOfWeek(date);
  return `${month}월 ${day}일 ${dayOfWeek}요일`;
}

export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function getWeekDates(date: Date): Date[] {
  const currentKST = new Date(date);
  const day = currentKST.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Shift to the Monday of the current week (Monday is day 1)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(currentKST);
  monday.setDate(currentKST.getDate() + diffToMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) { // Monday to Friday (5 days)
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeekOfMonth(date: Date): string {
  const month = date.getMonth() + 1;
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 indicates Sunday
  
  // Shift to calculate the week index (where Monday is start of the week)
  const day = date.getDate();
  const dayShift = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const week = Math.ceil((day + dayShift) / 7);
  
  return `${month}월 ${week}주차`;
}

export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const kst = new Date(today);
  
  if (day === 0) { // Sunday -> select the next Monday
    kst.setDate(today.getDate() + 1);
  } else if (day === 6) { // Saturday -> select previous Friday
    kst.setDate(today.getDate() - 1);
  }
  return kst;
}
