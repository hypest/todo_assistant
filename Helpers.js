function min2ms(minutes) {
    return minutes * 60 * 1000;
}

function hourMin(date) {
  return date.toLocaleString([], {timeStyle:'short',hour12:false});
}

function oneWeekFrom(start) {
  const daysToAdd = 1 + 7 + (start.getDay() == 0 ? 0 : 7-start.getDay());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return new Date(startDay.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
}

function getTitle(message) {
  return message.getSubject();
}

function clearAndGetAutoBook(now) {
  const cal = CalendarApp.getCalendarById(AUTOBOOK_CALENDAR_ID);
  const events = cal.getEvents(new Date(now.getTime() - (10 * 7 * 24 * 60 * 60 * 1000)), new Date(now.getTime() + (10 * 7 * 24 * 60 * 60 * 1000)));
  events.forEach((ev) => { ev.deleteEvent(); });
  return cal;
}

function markSpot(title, description, caretTimeMS, duration_ms) {
  const cal = clearAndGetAutoBook(new Date(caretTimeMS));
  const endDate = new Date(caretTimeMS + duration_ms);
  cal.createEvent(title, new Date(caretTimeMS), endDate, {description: description});
}

function findAndMarkSchedule(title, events, duration_ms, nowTimeMS = new Date().getTime(), untilTimeMS = oneWeekFrom(now).getTime()) {
  // const cal = clearAndGetAutoBook(now);
  const foundSpots = findSchedule(events, duration_ms, nowTimeMS, untilTimeMS);
  if (foundSpots[0]) {
    // const endDate = new Date(foundSpots[0].caret.getTime() + duration_ms);
    // cal.createEvent(title, foundSpots[0].caret, endDate);
  }
  return foundSpots;
}

function colorize(text, color) {
  return `<font color=${color}>${text}</font>`;
}

function bullet(isSelected, color) {
  const bul = (isSelected ? '◉ ' : '◎ ');
  if (color) {
    return colorize(bul, color);
  } else {
    return bul;
  }
}

function truncate(str, n){
  return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
}
