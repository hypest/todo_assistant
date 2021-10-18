eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js').getContentText());

function testScheduler() {
  const events = getNextWeekEvents(CalendarApp.getCalendarsByName("stefanos.togoulidis@a8c.com").concat(CalendarApp.getCalendarsByName("gates")));

  // console.log(events);
  // events.forEach((event, index, array) => {
  //   console.log(event.getTitle());
  // });

  const sortedEvents = sortEvents(events.slice(0));
  const offset = new Date((new Date()).getTime() + 11 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  const found = findSpot(sortedEvents, offset, 3 * 60 * 60 * 1000);
  console.log(found);
}

function getNextWeekEvents(calendars) {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  return calendars.reduce((acc, calendar) => {
    // console.log(calendar.getName());
    const es = calendar.getEvents(now, oneWeekFromNow);
    acc = acc.concat(es);
    return acc;
  }, []);
}

function sortEvents(events) {
  return events.sort((a, b) => {
    if (a.getStartTime().getTime() <= b.getStartTime().getTime()) {
      return -1;
    } else {
      return 1;
    }
  });
}

function findSpot(events, after, duration_ms, ignoreAllDayEvents=true) {
  const found = events.reduce((prev, event) => {
    // console.log(event.getStartTime());
    // console.log(`Checking: prev:${prev}, ev:${event.getTitle()} (${event.getStartTime()})`)
    if (ignoreAllDayEvents && event.isAllDayEvent()) {
      // console.log("Ignoring all day events for now");
      return prev;
    }

    const prevTime = prev.getTime();
    const eventStartTime = event.getStartTime().getTime();
    const eventEndTime = event.getEndTime().getTime();
    if (eventStartTime < prevTime) {
      if (eventEndTime <= prevTime) {
        // console.log(`Returning ${prev}`);
        return prev;
      } else {
        // console.log(`Returning ${event.getEndTime()}`);
        return event.getEndTime();
      }
    }

    if ((eventStartTime - prev.getTime()) > duration_ms) {
        // console.log(`Returning ${prev}`);
      return prev;
    } else {
        // console.log(`Returning ${event.getEndTime()}`);
      return event.getEndTime();
    }
  }, after);

  return found;
}