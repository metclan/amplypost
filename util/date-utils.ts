/**
 * Get the number of days in a specific month
 * @param year - The year
 * @param month - The month (0-11, where 0 is January)
 * @returns The number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 * @param year - The year
 * @param month - The month (0-11, where 0 is January)
 * @returns The day of the week (0-6)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Get the full month name from a month number
 * @param month - The month (0-11, where 0 is January)
 * @returns The full month name
 */
export function getMonthName(month: number): string {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
}

/**
 * Check if a specific date is today
 * @param day - The day of the month
 * @param month - The month (0-11, where 0 is January)
 * @param year - The year
 * @returns True if the date is today, false otherwise
 */
export function isToday(day: number, month: number, year: number): boolean {
    const today = new Date();
    return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
    );
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day, false otherwise
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}
