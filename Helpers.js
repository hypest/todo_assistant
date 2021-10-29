function min2ms(minutes) {
    return minutes * 60 * 1000;
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

function findAndMarkSchedule(title, events, duration_ms, nowTimeMS = new Date().getTime(), untilTimeMS = oneWeekFrom(now).getTime()) {
  // const cal = clearAndGetAutoBook(now);
  const date_time = findSchedule(events, duration_ms, nowTimeMS, untilTimeMS)[0].caret;
  // console.log(`Found date_time:${date_time} for duration:${duration_ms}`);
  if (date_time) {
    const endDate = new Date(date_time.getTime() + duration_ms);
    // cal.createEvent(title, date_time, endDate);
  }
  return date_time;
}
