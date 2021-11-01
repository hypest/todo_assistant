const DEFAULT_DURATION_MS = min2ms(30);
const AUTOBOOK_CALENDAR_ID = "6f0cu5b0kg8iuau58cae2sinp8@group.calendar.google.com";

const INPUT_CALENDARS_PROP_KEY = 'input_calendars';
const CALENDARS = JSON.parse(PropertiesService.getScriptProperties().getProperty(INPUT_CALENDARS_PROP_KEY) || []).map(calId => CalendarApp.getCalendarById(calId));
