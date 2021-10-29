// var FIELDNAMES = ['Date', 'Amount', 'Description', 'Spreadsheet URL'];

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
  
  var formSection = createFormSection(CardService.newCardSection(), opt_prefills);
  card.addSection(formSection);
  
  return card;
}

function onDurationSelected(duration_ms, opt_prefills) {
  opt_prefills.date_time = findAndMarkSchedule(opt_prefills.title, opt_prefills.events, duration_ms, opt_prefills.startTimeMS, opt_prefills.untilTimeMS);
  opt_prefills.duration_ms = duration_ms;

  // rebuild the card
  const updatedCard = createSchedulerCard(opt_prefills);
 
  // set the new card as the root one, replacing the previous
  return CardService.newActionResponseBuilder().setNavigation(
      CardService.newNavigation()
      .popToRoot()
      .updateCard(updatedCard.build())
    ).build();
}

function handleDurationSelectionChange(e) {
  // get the new duration from the grid identifier
  const duration_ms = Number(e.parameters.grid_item_identifier);
 
  // we sent the prefills as JSON (as simple object was failing in the setParameters stage)
  const opt_prefills = JSON.parse(e.parameters.prefills);

  return onDurationSelected(duration_ms, opt_prefills);
}

function createGridItem(label, minutes, opt_prefills) {
  const ms = min2ms(minutes);
  const isSelected = ms == (opt_prefills?.duration_ms ? opt_prefills?.duration_ms : DEFAULT_DURATION_MS);
  const gridItem = CardService.newGridItem()
    .setTitle((isSelected ? '◉ ' : '◎ ') + label)
    .setIdentifier(ms);
  return gridItem;
}

function buttonsGrid(opt_prefills) {
  const durationChangeAction = CardService.newAction()
      .setFunctionName("handleDurationSelectionChange")
      .setParameters({prefills: JSON.stringify(opt_prefills)}); // pass all the prefills as JSON, was failing if as plain object

  const grid = CardService.newGrid()
    .setTitle("Pick duration")
    .addItem(createGridItem('10m', 10, opt_prefills))
    .addItem(createGridItem('30m', 30, opt_prefills))
    .addItem(createGridItem('45m', 45, opt_prefills))
    .addItem(createGridItem('1h', 60, opt_prefills))
    .addItem(createGridItem('2h', 120, opt_prefills))
    .addItem(createGridItem('4h', 240, opt_prefills))
    .setNumColumns(3)
    .setOnClickAction(durationChangeAction);

  return grid;
}

/**
 * Creates form section to be displayed on card.
 *
 * @param {CardSection} section The card section to which form items are added.
 * @returns {CardSection}
 */
function createFormSection(section, opt_prefills) {
    const titleInput = CardService.newTextInput()
        .setFieldName("title_field");
    if (opt_prefills && opt_prefills.title) {
        titleInput.setValue(opt_prefills.title);
    }
    section.addWidget(titleInput);

    section.addWidget(buttonsGrid(opt_prefills));

    const dateTimeLabel = CardService.newTextParagraph();
    const dateTimePicker = CardService.newDateTimePicker()
      .setTitle("Spot found:")
      .setFieldName("date_time_field");
      // Set default value as Jan 1, 2018, 3:00 AM UTC. Either a number or string is acceptable.
    if (opt_prefills && opt_prefills.date_time) {
      dateTimePicker.setValueInMsSinceEpoch(opt_prefills.date_time.getTime());
      dateTimeLabel.setText(opt_prefills.date_time.toString());
    }
      // .setValueInMsSinceEpoch(1514775600);
      // // EDT time is 5 hours behind UTC.
      // .setTimeZoneOffsetInMins(-5 * 60)
      // .setOnChangeAction(CardService.newAction()
      // .setFunctionName("handleDateTimeChange"));
    section.addWidget(dateTimeLabel);
    section.addWidget(dateTimePicker);

    // for (var i = 0; i < inputNames.length; i++) {
    //     var widget = CardService.newTextInput()
    //     .setFieldName(inputNames[i])
    //     .setTitle(inputNames[i]);
    //     if (opt_prefills && opt_prefills[i]) {
    //         widget.setValue(opt_prefills[i]);
    //     }
    //     section.addWidget(widget);
    // }
    return section;
}

/**
 * Creates the main card users see with form inputs to log expenses.
 * Form can be prefilled with values.
 *
 * @param {String[]} opt_prefills Default values for each input field.
 * @param {String} opt_status Optional status displayed at top of card.
 * @returns {Card}
 */
function createExpensesCard(opt_prefills, opt_status) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Log Your Expense'));
  
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
  
  var formSection = createFormSection(CardService.newCardSection(),
                                      FIELDNAMES, opt_prefills);
  card.addSection(formSection);
  
  return card;
}

// /**
//  * Creates form section to be displayed on card.
//  *
//  * @param {CardSection} section The card section to which form items are added.
//  * @param {String[]} inputNames Names of titles for each input field.
//  * @param {String[]} opt_prefills Default values for each input field.
//  * @returns {CardSection}
//  */
// function createFormSection(section, inputNames, opt_prefills) {
//   for (var i = 0; i < inputNames.length; i++) {
//     var widget = CardService.newTextInput()
//       .setFieldName(inputNames[i])
//       .setTitle(inputNames[i]);
//     if (opt_prefills && opt_prefills[i]) {
//       widget.setValue(opt_prefills[i]);
//     }
//     section.addWidget(widget);
//   }
//   return section;
// }
