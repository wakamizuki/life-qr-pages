const SPREADSHEET_ID = '1uFreLM8GeVXAmGet1klmTQdQ7x5soNp8Md6CBIwGbT4';
const SHEET_NAME = 'conversation_logs';
const SHARED_TOKEN = '';

function doGet() {
  return jsonOutput({
    ok: true,
    message: 'Conversation log endpoint is running.',
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
  });
}

function doPost(e) {
  try {
    const body = parseRequestBody_(e);
    const token = body.token || '';
    const payload = body.payload || {};

    if (SHARED_TOKEN && token !== SHARED_TOKEN) {
      return jsonOutput({ ok: false, error: 'Unauthorized' });
    }

    const sheet = getOrCreateSheet_();
    ensureHeader_(sheet);

    const row = [
      new Date(),
      payload.savedAt || '',
      payload.pageUrl || '',
      payload.summary || '',
      payload.reflection || '',
      payload.nextAction || '',
      payload.hypothesis || '',
      payload.question || '',
      payload.herPriorities || '',
      payload.actionSignals || '',
      payload.myPriorities || '',
      payload.gap || '',
      stringifyChecklist_(payload.checklistStatus),
    ];

    sheet.appendRow(row);

    return jsonOutput({ ok: true, row: sheet.getLastRow() });
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: error.message,
    });
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const existing = spreadsheet.getSheetByName(SHEET_NAME);
  if (existing) {
    return existing;
  }

  const sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'loggedAt',
    'savedAtIso',
    'pageUrl',
    'summary',
    'reflection',
    'nextAction',
    'hypothesis',
    'question',
    'herPriorities',
    'actionSignals',
    'myPriorities',
    'gap',
    'checklistStatus',
  ]);

  sheet.setFrozenRows(1);
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  const raw = e.postData.contents;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {
      payload: {
        raw,
      },
    };
  }
}

function stringifyChecklist_(items) {
  if (!Array.isArray(items)) {
    return '';
  }

  return items
    .map(function(item) {
      const mark = item.checked ? 'yes' : 'no';
      return item.title + ': ' + mark;
    })
    .join(' | ');
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
