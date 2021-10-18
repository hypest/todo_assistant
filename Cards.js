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

function min2ms(minutes) {
    return minutes * 60 * 1000;
}
/**
 * Creates form section to be displayed on card.
 *
 * @param {CardSection} section The card section to which form items are added.
 * @returns {CardSection}
 */
function createFormSection(section, opt_prefills) {
    const titleInput = CardService.newTextInput()
        .setTitle("Title")
        .setFieldName("title_field");
    if (opt_prefills && opt_prefills.title) {
        titleInput.setValue(opt_prefills.title);
    }
    section.addWidget(titleInput);

    const durationSelection = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.RADIO_BUTTON)
        .setTitle("Pick duration")
        .setFieldName("duration_field")
        .addItem("10min", min2ms(10), false)
        .addItem("30min", min2ms(30), true)
        .addItem("1h", min2ms(60), false)
        .addItem("2h", min2ms(120), false)
        .addItem("4h", min2ms(240), false);
    section.addWidget(durationSelection);

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
