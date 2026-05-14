export const getDaysInMonth = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));
};

export const getCalendarGrid = (date: Date): (Date | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const numDays = new Date(year, month + 1, 0).getDate();

  const grid: (Date | null)[] = [];

  // Add empty cells for the start of the week
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= numDays; i++) {
    grid.push(new Date(year, month, i));
  }

  // Add empty cells for the end of the week to make it a multiple of 7
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
};
