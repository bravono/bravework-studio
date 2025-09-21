export default function getWeeksBtwDates(startDate, endDate) {
  // Validate that both inputs are valid Date objects
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    console.error("Invalid input. Please provide valid Date objects.");
    return null;
  }

  // Calculate the difference in milliseconds
  console.log("End Date", endDate, "Start Date", startDate);
  const durationInMilliseconds = endDate.getTime() - startDate.getTime();
  console.log("Milliseconds", durationInMilliseconds);

  // Define milliseconds in a week
  const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;
  console.log("Milliseconds in a week", millisecondsInAWeek);

  // Calculate and return the number of full weeks
  console.log("Final result", durationInMilliseconds / millisecondsInAWeek);
  return Math.floor(durationInMilliseconds / millisecondsInAWeek);
}

// Example usage
const start = new Date("2025-10-26T10:00:00Z");
const end = new Date("2025-11-23T10:00:00Z");

const weeks = getWeeksBtwDates(start, end);

console.log(`The duration is ${weeks} weeks.`);
