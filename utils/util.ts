// ─── Epoch Utilities ───────────────────────────────────────

// Returns current epoch time in seconds
export const getCurrentEpoch = (): number => {
  return Math.floor(Date.now() / 1000);
};

// Converts epoch seconds to a Date object
export const epochToDate = (epoch: number): Date => {
  return new Date(epoch * 1000);
};

// ─── Time Range Helpers ────────────────────────────────────

export const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};

export const endOfDay = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59
  );
};

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
};

export const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
};

// ─── Epoch Range Generators ────────────────────────────────

export const getEpochRangeForToday = (): [number, number] => {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);
  return [Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)];
};

export const getEpochRangeForThisMonth = (): [number, number] => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return [Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)];
};

// Generic range getter for any date's day
export const getEpochRangeForDate = (date: Date): [number, number] => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  return [Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)];
};

// Generic range getter for any date's month
export const getEpochRangeForMonth = (date: Date): [number, number] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return [Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)];
};

// Generic range getter for any date's year
export const getEpochRangeForYear = (date: Date): [number, number] => {
  const start = new Date(date.getFullYear(), 0, 1, 0, 0, 0);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
  return [Math.floor(start.getTime() / 1000), Math.floor(end.getTime() / 1000)];
};
