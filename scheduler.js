// eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js').getContentText());

function testScheduler() {
  const events = getNextWeekEvents(CalendarApp.getCalendarsByName("stefanos.togoulidis@a8c.com").concat(CalendarApp.getCalendarsByName("gates")));

  // console.log(events);
  // events.forEach((event, index, array) => {
  //   console.log(event.getTitle());
  // });

  const sortedEvents = sortEvents(events.slice(0));
  const offset = new Date((new Date()).getTime() + 11 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  const found = findSpot(sortedEvents, offset, 3 * 60 * 60 * 1000);
  console.log(`Prev: ${found.pE?.getTitle()}\nfound: ${found.caret}\nNext: ${found.aE?.getTitle()}`);
}

function findSchedule(duration = 30 * 60 * 1000 /* 30mins */) {
  const events = getNextWeekEvents(
    CalendarApp.getCalendarsByName("stefanos.togoulidis@a8c.com")
    .concat(CalendarApp.getCalendarsByName("gates")));

  const sortedEvents = sortEvents(events.slice(0));
  const now = new Date();
  return findSpot(sortedEvents, now, duration);
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
  const foundCtx = events.reduce((ctx, event) => {
    const {pE, caret,aE} = ctx;
    if (ignoreAllDayEvents && event.isAllDayEvent()) {
      // console.log("Ignoring all day events for now");
      return ctx;
    }

    const caretTime = caret.getTime();

    const eventStartTime = event.getStartTime().getTime();
    const eventEndTime = event.getEndTime().getTime();

    // check if event is earlier or colliding
    if (eventStartTime < caretTime) {
      if (eventEndTime <= caretTime) {
        return {pE:event, caret, aE};
      } else {
        return {pE:event, caret:(event.getEndTime()), aE};
      }
    }

    // check if there's enough time until the event
    if ((eventStartTime - caretTime) < duration_ms) {
      return {pE:event, caret:(event.getEndTime()), aE};
    } else {
      // next event is already found, just return the current context
      if (aE) {
        return ctx;
      }

      // there's enough space until the event so, mark the event as next.
      return {pE, caret, aE:event};
    }
  }, {caret:after});

  return foundCtx;
}