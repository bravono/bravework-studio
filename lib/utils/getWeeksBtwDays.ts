export default function getWeeksBtwDates(startDate, endDate) {
  // Convert to Date objects if they are strings
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  console.log("Start Date:", start);
  console.log("End Date:", end);
  console.log("EndDate:", endDate);

  // Validate that both inputs are valid Date objects
  if (!(start instanceof Date) || !(end instanceof Date)) {
    console.error("Invalid input. Please provide valid Date objects.");
    return null;
  }

  // Calculate the difference in milliseconds
  const durationInMilliseconds = end.getTime() - start.getTime();
  const millisecondsInADay = 1000 * 60 * 60 * 24;
  const millisecondsInAWeek = millisecondsInADay * 7;
  const daysDiff = durationInMilliseconds / millisecondsInADay;

  if (daysDiff < 7) {
    return `${Math.round(daysDiff)} day${
      Math.round(daysDiff) === 1 ? "" : "s"
    }`;
  } else {
    const weeks = daysDiff / 7;
    return `${weeks.toFixed(1)} week${weeks >= 2 ? "s" : ""}`;
  }
}
