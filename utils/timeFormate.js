function parseDateTime(dateStr, timeStr) {
  const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/);

  if (!timeParts) return null;

  let hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);
  const modifier = timeParts[3];

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);

  return date;
}
module.exports = parseDateTime;
