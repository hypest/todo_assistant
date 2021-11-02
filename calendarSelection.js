function getCalendarSelectionCardForContext(e) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Select input calendars'));
  
  card.addSection(createCalendarSection(CalendarApp.getAllCalendars()));

  card.setFixedFooter(CardService.newFixedFooter()
    .setPrimaryButton(
        CardService.newTextButton()
            .setText("Submit")
            .setOnClickAction(CardService.newAction()
              .setFunctionName("handleSubmitCalendarsSelection")
              .setParameters({event:JSON.stringify(e)}))));

  return card;
}

function handleSubmitCalendarsSelection(e) {
  PropertiesService.getScriptProperties().setProperty(
    INPUT_CALENDARS_PROP_KEY, JSON.stringify(e.commonEventObject.formInputs.calendars_field?.stringInputs.value || []));

  return CardService.newActionResponseBuilder()
    .setStateChanged(true)
    .setNavigation(CardService.newNavigation()
      .popToRoot()
      .updateCard(getSchedulerCardForContext(JSON.parse(e.parameters.event)).build())
    ).build();
}

function createCalendarsWidget(calendars, selectedCalendars=[]) {
  const calendarsWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    // .setTitle("Select which calendars to check.")
    .setFieldName("calendars_field");

  calendars.forEach((cal) => {
    calendarsWidget.addItem(cal.getName(), cal.getId(), selectedCalendars.includes(cal.getId()));
  });

  return calendarsWidget;
}

function createCalendarSection(calendars) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const selectedCalendars = JSON.parse(scriptProperties.getProperty(INPUT_CALENDARS_PROP_KEY) || '[]');

  return CardService.newCardSection()
    .addWidget(createCalendarsWidget(calendars, selectedCalendars));
}
