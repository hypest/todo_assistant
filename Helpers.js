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

// /**
//  * Finds largest dollar amount from email body.
//  * Returns null if no dollar amount is found.
//  *
//  * @param {Message} message An email message.
//  * @returns {String}
//  */
//  function getLargestAmount(message) {
//     return 'TODO';
//   }
  
//   /**
//    * Determines date the email was received.
//    *
//    * @param {Message} message An email message.
//    * @returns {String}
//    */
//   function getReceivedDate(message) {
//     return 'TODO';
//   }
  
//   /**
//    * Determines expense description by joining sender name and message subject.
//    *
//    * @param {Message} message An email message.
//    * @returns {String}
//    */
//   function getExpenseDescription(message) {
//     return 'TODO';
//   }
  
//   /**
//    * Determines most recent spreadsheet URL.
//    * Returns null if no URL was previously submitted.
//    *
//    * @returns {String}
//    */
//   function getSheetUrl() {
//     return 'TODO';
//   }
  