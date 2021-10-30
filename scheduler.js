// eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js').getContentText());

function testScheduler() {
  const now = new Date();
  const events = getEvents(CALENDARS, now, oneWeekFrom(now));

  // console.log(events);
  // events.forEach((event, index, array) => {
  //   console.log(event.getTitle());
  // });

  const sortedEvents = removeEngulfed(sortEvents(events));
  const offset = now;//new Date(now.getTime() + 11 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  // const offset = new Date(now.getTime() + 11 * 60 * 60 * 1000 + 96 * 60 * 60 * 1000);
  const founds = findSpot(sortedEvents, offset.getTime(), 3 * 60 * 60 * 1000, oneWeekFrom(now).getTime());
  founds.forEach( (found) => {
      console.log(`Prev: ${found.pE?.getTitle()}\nfound: ${found.caret}\nNext: ${found.aE?.getTitle()}`);
  });
}

function testFindSchedule() {
  const now = new Date();
  const until = oneWeekFrom(now);

  console.time("Get events");
  const events = getEvents(CALENDARS, now, until);
  console.timeEnd("Get events");
 
  var founds = findSchedule(events, 3 * 60 * 60 * 1000, now, until);
  founds.forEach( (found) => {
      console.log(`Prev: ${found.pE?.getTitle()}\nfound: ${found.caret}\nNext: ${found.aE?.getTitle()}`);
  });
  founds = findSchedule(events, 3 * 60 * 60 * 1000, now, until);
  founds.forEach( (found) => {
      console.log(`Prev: ${found.pE?.getTitle()}\nfound: ${found.caret}\nNext: ${found.aE?.getTitle()}`);
  });
}

function findSchedule(events, duration, nowTimeMS, untilTimeMS) {
  // console.time("Sort events");
  const sortedEvents = removeEngulfed(sortEvents(events));
  // console.timeEnd("Sort events");
  // console.time("Find spot");
  const s = findSpot(sortedEvents, nowTimeMS, duration, untilTimeMS);
  // console.timeEnd("Find spot");
  return s;
}

function getEvents(calendars, after, until) {
  return calendars.reduce((acc, calendar) => {
    // console.log(calendar.getName());
    const es = calendar.getEvents(after, until);
    es.forEach((event) => {
      event.title = event.getTitle();
      event.startTime = event.getStartTime();
      event.endTime = event.getEndTime();
      event.startTimeMS = event.startTime.getTime();
      event.endTimeMS = event.endTime.getTime();
      event.isAllDayEvent = event.isAllDayEvent();
    })
    acc = acc.concat(es);
    return acc;
  }, []);
}

function sortEvents(events) {
  return events.slice(0).sort((a, b) => {
    if (a.startTimeMS <= b.startTimeMS) {
      return -1;
    } else {
      return 1;
    }
  });
}

function removeEngulfed(events) {
  return events.reduce((acc, event) => {
    // when in the start, just return an array with the item
    if (acc.length == 0) {
      return [event];
    }

    if (event.endTimeMS <= acc[acc.length-1].endTimeMS) {
      return acc;
    } else {
      acc.push(event);
      return acc;
    }
  }, []);
}

function findSpot(events, afterTimeMS, duration_ms, beforeTimeMS, ignoreAllDayEvents=true) {
  const foundCtx = events.reduce((ctx, event, index, array) => {
    const [{pE, caretTimeMS, aE}, ...others] = ctx;

    if (aE) {
      // next event is already found so the search is over, just return the current context
      return ctx;
    }

    if (ignoreAllDayEvents && event.isAllDayEvent) {
      // console.log("Ignoring all day events for now");
      return ctx;
    }

    const eventStartTime = event.startTimeMS;
    const eventEndTime = event.endTimeMS;

    // console.log(`pE: ${pE ? pE.getTitle():'null'}\nEvent: ${event.getTitle()}\nEvent start: ${event.getStartTime()}\nEvent end: ${event.endTime}\nCaret: ${caretTimeMS}`);
    // check if event is earlier or colliding
    if (eventStartTime < caretTimeMS) {
      return [
        {
          pE:event,
          caretTimeMS: (eventEndTime <= caretTimeMS)
            ? caretTimeMS // event ends before the caret so, caret is still the later
            : event.endTimeMS, // event ends after the caret so, bump the caret to the end of the event
          aE
        },
        ...others
      ];
    }
    // event starts after the caret

    // check if there's enough time between the caret and the event
    if ((eventStartTime - caretTimeMS) < duration_ms) {
      // there isn't enough time so, move caret to the end of the event
      return [
        {
          pE:event,
          caretTimeMS:(event.endTimeMS),
          aE
        },
        ...others
      ];
    } else {
      // there's enough space until the event so, mark the event as next.

      // but first, let's find the next available spot (recursively)
      const nextOptions = findSpot(array.slice(index), event.endTimeMS, duration_ms, beforeTimeMS, ignoreAllDayEvents);
      others.push(...nextOptions);

      return [
        {
          pE,
          caretTimeMS,
          aE:event
        },
        ...others
      ];
    }
  }, [{caretTimeMS:afterTimeMS}]);

  if (! foundCtx[0].aE && (foundCtx[0].caretTimeMS + duration_ms) > beforeTimeMS) {
    // we've reached the end of the events list but there's not enough time left so, return empty
    return [];
  }

  foundCtx[0].caret = new Date(foundCtx[0].caretTimeMS);

  return foundCtx;
}