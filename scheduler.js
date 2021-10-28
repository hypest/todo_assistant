// eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js').getContentText());

function testScheduler() {
  const now = new Date();
  const events = getNextWeekEvents(CalendarApp.getCalendarsByName("stefanos.togoulidis@a8c.com").concat(CalendarApp.getCalendarsByName("gates")), now);

  // console.log(events);
  // events.forEach((event, index, array) => {
  //   console.log(event.getTitle());
  // });

  const sortedEvents = sortEvents(events.slice(0));
  const offset = new Date(now.getTime() + 11 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  const founds = findSpot(sortedEvents, offset, 3 * 60 * 60 * 1000, oneWeekFrom(now));
  founds.forEach( (found) => {
      console.log(`Prev: ${found.pE?.getTitle()}\nfound: ${found.caret}\nNext: ${found.aE?.getTitle()}`);
  });
}

function findSchedule(duration, now) {
  const events = getNextWeekEvents(
    CalendarApp.getCalendarsByName("stefanos.togoulidis@a8c.com")
    .concat(CalendarApp.getCalendarsByName("gates"))
    , now);

  const sortedEvents = sortEvents(events.slice(0));
  return findSpot(sortedEvents, now, duration, before);
}

function oneWeekFrom(now) {
  return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
}

function getNextWeekEvents(calendars, now) {
  return calendars.reduce((acc, calendar) => {
    // console.log(calendar.getName());
    const es = calendar.getEvents(now, oneWeekFrom(now));
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

function findSpot(events, after, duration_ms, before, ignoreAllDayEvents=true) {
  const foundCtx = events.reduce((ctx, event, index, array) => {
    const [{pE, caret, aE}, ...others] = ctx;

    if (aE) {
      // next event is already found so the search is over, just return the current context
      return ctx;
    }

    if (ignoreAllDayEvents && event.isAllDayEvent()) {
      // console.log("Ignoring all day events for now");
      return ctx;
    }

    const caretTime = caret.getTime();

    const eventStartTime = event.getStartTime().getTime();
    const eventEndTime = event.getEndTime().getTime();

    // check if event is earlier or colliding
    if (eventStartTime < caretTime) {
      return [
        {
          pE:event,
          caret: (eventEndTime <= caretTime)
            ? caret // event ends before the caret so, caret is still the later
            : event.getEndTime(), // event ends after the caret so, bump the caret to the end of the event
          aE
        },
        ...others
      ];
    }
    // event starts after the caret

    // check if there's enough time between the caret and the event
    if ((eventStartTime - caretTime) < duration_ms) {
      // there isn't enough time so, move caret to the end of the event
      return [
        {
          pE:event,
          caret:(event.getEndTime()),
          aE
        },
        ...others
      ];
    } else {
      // there's enough space until the event so, mark the event as next.

      // but first, let's find the next available spot (recursively)
      const nextOptions = findSpot(array.slice(index), event.getEndTime(), duration_ms, before, ignoreAllDayEvents);
      others.push(...nextOptions);

      return [
        {
          pE,
          caret,
          aE:event
        },
        ...others
      ];
    }
  }, [{caret:after}]);

  if (! foundCtx[0].aE && (foundCtx[0].caret.getTime() + duration_ms) > before.getTime()) {
    // we've reached the end of the events list but there's no enough time left so, return empty
    return [];
  }

  return foundCtx;
}