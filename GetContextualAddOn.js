/**
 * Returns the contextual add-on data that should be rendered for
 * the current e-mail thread. This function satisfies the requirements of
 * an 'onTriggerFunction' and is specified in the add-on's manifest.
 *
 * @param {Object} event Event containing the message ID and other context.
 * @returns {Card[]}
 */
function getContextualAddOn(event) {
  var message = getCurrentMessage(event);
  const title = getTitle(message);

  const now = new Date();
  const until = oneWeekFrom(now);
  const events = getEvents(CALENDARS, now, until);

  var prefills = {
      title: title,
      events: events,
      startTimeMS: now.getTime(),
      untilTimeMS: until.getTime(),
      foundSpots: findAndMarkSchedule(title, events, DEFAULT_DURATION_MS, now, until)
  };
  var card = createSchedulerCard(prefills);

  return [card.build()];
}
  
/**
 * Retrieves the current message given an action event object.
 * @param {Event} event Action event object
 * @return {Message}
 */
function getCurrentMessage(event) {
  var accessToken = event.messageMetadata.accessToken;
  var messageId = event.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  return GmailApp.getMessageById(messageId);
}
