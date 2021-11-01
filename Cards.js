function getSchedulerCardForContext(event) {
  const message = getCurrentMessage(event);
  const title = getTitle(message);

  const now = new Date();
  const until = oneWeekFrom(now);
  const events = getEvents(CALENDARS, now, until);

  const prefills = {
      title: title,
      emailId: message.getId(),
      emailLink: `https://mail.google.com/mail/u/0/#all/${message.getId()}`,
      events: events,
      startTimeMS: now.getTime(),
      untilTimeMS: until.getTime(),
      foundSpots: findAndMarkSchedule(title, events, DEFAULT_DURATION_MS, now, until)
  };

  return createSchedulerCard(prefills);
}

function createSchedulerCard(opt_prefills, opt_status) {
  var card = CardService.newCardBuilder();
  // card.setHeader(CardService.newCardHeader().setTitle('Schedule a task'));
  
  if (opt_status) {
    if (opt_status.indexOf('Error: ') == 0) {
      opt_status = '<font color=\'#FF0000\'>' + opt_status + '</font>';
    } else {
      opt_status = '<font color=\'#228B22\'>' + opt_status + '</font>';
    }
    var statusSection = CardService.newCardSection();
    statusSection.addWidget(CardService.newTextParagraph()
      .setText('<b>' + opt_status + '</b>'));
    card.addSection(statusSection);
  }
  
  card.addSection(createTitleSection(opt_prefills));
  card.addSection(createDurationSection(opt_prefills));
  card.addSection(createFoundSection(opt_prefills));
  // card.addSection(createCalendarSection(CalendarApp.getAllCalendars()));
  
  return card;
}

function rebuildAndSetCard(opt_prefills) {
  // rebuild the card
  const updatedCard = createSchedulerCard(opt_prefills);
 
  // set the new card as the root one, replacing the previous
  return CardService.newActionResponseBuilder().setNavigation(
      CardService.newNavigation()
      .popToRoot()
      .updateCard(updatedCard.build())
    ).build();
}

function onDurationSelected(duration_ms, opt_prefills) {
  opt_prefills.foundSpots = findAndMarkSchedule(opt_prefills.title, opt_prefills.events, duration_ms, opt_prefills.startTimeMS, opt_prefills.untilTimeMS);
  opt_prefills.duration_ms = duration_ms;

  return rebuildAndSetCard(opt_prefills);
}

function handleDurationSelectionChange(e) {
  // get the new duration from the grid identifier
  const duration_ms = Number(e.parameters.grid_item_identifier);
 
  // we sent the prefills as JSON (as simple object was failing in the setParameters stage)
  const opt_prefills = JSON.parse(e.parameters.prefills);

  return onDurationSelected(duration_ms, opt_prefills);
}

function handleSpotClick(e) {
  // we sent the prefills as JSON (as simple object was failing in the setParameters stage)
  const opt_prefills = JSON.parse(e.parameters.prefills);

  opt_prefills.title = e.commonEventObject.formInputs.title_field.stringInputs.value[0];
  opt_prefills.description = e.commonEventObject.formInputs.description_field.stringInputs.value[0];

  if (opt_prefills.selected_spot) {
    markSpot(opt_prefills.title, opt_prefills.description, new Date(opt_prefills.selected_spot.caret).getTime(), opt_prefills.duration_ms);
  } else {
    clearAndGetAutoBook(new Date());
  }

  return rebuildAndSetCard(opt_prefills);
}

function durationFromPrefills(opt_prefills) {
  return (opt_prefills?.duration_ms ? opt_prefills?.duration_ms : DEFAULT_DURATION_MS);
}

function createGridItem(label, minutes, opt_prefills) {
  const ms = min2ms(minutes);
  const isSelected = ms == durationFromPrefills(opt_prefills);
  return CardService.newGridItem()
    .setTitle(bullet(isSelected) + label)
    .setIdentifier(ms);
}

function buttonsGrid(opt_prefills) {
  const durationChangeAction = CardService.newAction()
      .setFunctionName("handleDurationSelectionChange")
      .setParameters({prefills: JSON.stringify(opt_prefills)}); // pass all the prefills as JSON, was failing if as plain object

  const grid = CardService.newGrid()
    .setNumColumns(3)
    .setOnClickAction(durationChangeAction);

    [['10m', 10], ['30m', 30], ['45m', 45],
      ['1h', 60], ['2h', 120], ['4h', 240]].forEach(
        ([label, mins]) => grid.addItem(createGridItem(label, mins, opt_prefills))
    )

  return grid;
}

function createTitleSection(opt_prefills) {
  const section = CardService.newCardSection();

  const titleInput = CardService.newTextInput()
      .setFieldName("title_field")
      .setMultiline(true);
  if (opt_prefills && opt_prefills.title) {
      titleInput.setValue(opt_prefills.title);
  }
  section.addWidget(titleInput);

  section.addWidget(CardService.newTextInput()
    .setFieldName("description_field")
    .setMultiline(true)
    .setHint('Description')
    .setValue(opt_prefills?.description || `<hr>Link to email: ${opt_prefills.emailLink}`));

  section.setCollapsible(true).setNumUncollapsibleWidgets(1);

  return section;
}

function createDurationSection(opt_prefills) {
  const section = CardService.newCardSection();
  section.setHeader('Pick duration');

  section.addWidget(buttonsGrid(opt_prefills));

  return section;
}

function createFoundSection(opt_prefills) {
  const section = CardService.newCardSection();

  console.log(`foundSpots: ${JSON.stringify(opt_prefills.foundSpots)}`);
  if (opt_prefills && opt_prefills?.foundSpots?.length == 0) {
    section.addWidget(CardService.newTextParagraph()
      .setText("Nothing found"));
    return section;
  }

  opt_prefills.foundSpots.forEach((spot) => {
    const pE = spot.pE;
    const prev = pE ? colorize(`┇&nbsp;<b>${hourMin(new Date(pE.startTime))}</b> ${pE.title}`, "#999999") : '(nothing)';

    const isSelected = spot.caretTimeMS == opt_prefills?.selected_spot?.caretTimeMS;
    const found = bullet(isSelected) + `<b>${hourMin(new Date(spot.caret))}</b> ${truncate(opt_prefills.title, 12)}`;

    const aE = spot.aE;
    const next = aE ? colorize(`┇&nbsp;<b>${hourMin(new Date(aE.startTime))}</b> ${aE.title}`, "#999999") : '(nothing)';

    section.addWidget(CardService.newDecoratedText()
      .setWrapText(true)
      .setText(`${prev}\n${found}\n${next}`)
      .setOnClickAction(CardService.newAction()
        .setFunctionName("handleSpotClick")
        .setParameters({prefills: JSON.stringify({...opt_prefills, selected_spot: (isSelected ? undefined : spot), duration_ms: durationFromPrefills(opt_prefills)})})));

    // const dateTimePicker = CardService.newDateTimePicker()
    //   .setTitle("Spot found:")
    //   .setFieldName("date_time_field");

    // dateTimePicker.setValueInMsSinceEpoch(opt_prefills.foundSpots[0].caretTimeMS);

    // section.addWidget(dateTimePicker);
  });

  section.setNumUncollapsibleWidgets(2);
  if (opt_prefills?.selected_spot && opt_prefills?.selected_spot?.caret != opt_prefills?.foundSpots[0]?.caret && opt_prefills?.selected_spot?.caret != opt_prefills?.foundSpots[1]?.caret) {
    section.setCollapsible(false);
  } else {
    section.setCollapsible(true);
  }

  return section;
}
