function handleCalendarsCheckboxes(e) {
  PropertiesService.getScriptProperties().setProperty(
    INPUT_CALENDARS_PROP_KEY, JSON.stringify(e.commonEventObject.formInputs.calendars_field.stringInputs.value));
}

function createCalendarsWidget(calendars, selectedCalendars=[]) {
  const calendarsWidget = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("Select which calendars to check.")
    .setFieldName("calendars_field")
    .setOnChangeAction(CardService.newAction()
      .setFunctionName("handleCalendarsCheckboxes"));

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