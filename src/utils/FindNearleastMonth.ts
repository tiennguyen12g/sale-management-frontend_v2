function getNearestMonth(data: string[]) {
  const now = new Date();
  const currentYM = new Date(now.getFullYear(), now.getMonth()); // current month as date

  // Convert "YYYY-MM" to Date
  const parsed = data.map(d => {
    const [y, m] = d.split("-").map(Number);
    return { str: d, date: new Date(y, m - 1) };
  });

  // Find the nearest by absolute difference
  parsed.sort((a, b) => {
    return Math.abs(a.date.getTime() - currentYM.getTime()) - 
           Math.abs(b.date.getTime() - currentYM.getTime());
  });

  return parsed[0].str; // nearest month in string format
}

// Example:
console.log(getNearestMonth(["2025-08", "2025-07", "2025-06"]));
