function getDatesOfMonth(dates: string[], year: number, month: number) {
  // month is 1–12
  return dates.filter(d => {
    const dt = new Date(d);
    return dt.getFullYear() === year && (dt.getMonth() + 1) === month;
  });
}

// Example:
const arr = ["2025-08-01", "2025-08-21", "2025-07-01", "2025-06-11"];
console.log(getDatesOfMonth(arr, 2025, 8)); 
// -> ["2025-08-01", "2025-08-21"]
