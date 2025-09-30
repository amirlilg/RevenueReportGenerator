function main() {
  Logger.log("Starting Phase 1: XML Parsing...");
  
  // Find the latest XML file
  var latestFile = findLatestXmlFile();
  if (!latestFile) {
    Logger.log("No XML files found in the folder.");
    return;
  }
  
  Logger.log("Processing latest file: " + latestFile.getName());
  
  // Parse the XML file
  var data = parseSmsBackup(latestFile);
  
  // Save parsed data to temporary spreadsheet
  var tempSheetId = saveParsedDataToTemp(data, latestFile.getName());
  
  Logger.log("Phase 1 completed. Parsed data saved to temp sheet: " + tempSheetId);
  
  // Schedule Phase 2
  schedulePhase2(tempSheetId);
  
  Logger.log("Phase 2 scheduled to run.");
}

function phase2ProcessAndGenerate() {
  Logger.log("Starting Phase 2: Data Processing and Report Generation...");
  
  // Get the temp sheet ID from script properties
  var props = PropertiesService.getScriptProperties();
  var tempSheetId = props.getProperty('TEMP_SHEET_ID');
  var fileName = props.getProperty('ORIGINAL_FILE_NAME');
  
  if (!tempSheetId || !fileName) {
    Logger.log("Error: Missing temp sheet ID or file name. Phase 1 may not have completed.");
    return;
  }
  
  // Load parsed data from temp sheet
  var data = loadParsedDataFromTemp(tempSheetId);
  
  Logger.log("Loaded " + data.length + " entries from temp sheet.");
  
  // Process the data
  var result = processBankData(data);
  
  // Generate the report
  generateReport(result, fileName);
  
  Logger.log("Phase 2 completed. Report generated successfully.");
  
  // Schedule Phase 3 cleanup
  schedulePhase3(tempSheetId);
  
  Logger.log("Phase 3 cleanup scheduled to run.");
}

function phase3Cleanup() {
  Logger.log("Starting Phase 3: Cleanup...");
  
  var props = PropertiesService.getScriptProperties();
  var tempSheetId = props.getProperty('TEMP_SHEET_ID');
  
  if (tempSheetId) {
    try {
      // Delete the temporary spreadsheet
      DriveApp.getFileById(tempSheetId).setTrashed(true);
      Logger.log("Temporary spreadsheet deleted.");
    } catch (e) {
      Logger.log("Error deleting temp sheet: " + e.toString());
    }
  }
  
  // Clear script properties
  props.deleteProperty('TEMP_SHEET_ID');
  props.deleteProperty('ORIGINAL_FILE_NAME');
  
  // Delete the one-time triggers
  deletePhaseTriggersBy('phase2ProcessAndGenerate');
  deletePhaseTriggersBy('phase3Cleanup');
  
  Logger.log("Phase 3 completed. All cleanup done.");
}

function saveParsedDataToTemp(data, fileName) {
  Logger.log("Saving parsed data to temporary spreadsheet...");
  
  var tempSheet = SpreadsheetApp.create('TEMP_ParsedData_' + new Date().getTime());
  var sheet = tempSheet.getActiveSheet();
  
  // Write headers
  sheet.appendRow(["Date", "Readable Date", "Address", "Contact Name", "Type", "Body"]);
  
  // Write data in batches to improve performance
  var batchSize = 1000;
  for (var i = 0; i < data.length; i += batchSize) {
    var batch = data.slice(i, Math.min(i + batchSize, data.length));
    if (batch.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, batch.length, batch[0].length).setValues(batch);
    }
  }
  
  // Save metadata to script properties
  var props = PropertiesService.getScriptProperties();
  props.setProperty('TEMP_SHEET_ID', tempSheet.getId());
  props.setProperty('ORIGINAL_FILE_NAME', fileName);
  
  Logger.log("Parsed data saved to temp spreadsheet: " + tempSheet.getId());
  
  return tempSheet.getId();
}

function loadParsedDataFromTemp(tempSheetId) {
  Logger.log("Loading parsed data from temporary spreadsheet...");
  
  var tempSheet = SpreadsheetApp.openById(tempSheetId);
  var sheet = tempSheet.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  data.shift();
  
  Logger.log("Loaded " + data.length + " rows from temp spreadsheet.");
  
  return data;
}

function schedulePhase2(tempSheetId) {
  ScriptApp.newTrigger('phase2ProcessAndGenerate')
    .timeBased()
    .after(15 * 1000) // Run after 15 seconds
    .create();
}

function schedulePhase3(tempSheetId) {
  ScriptApp.newTrigger('phase3Cleanup')
    .timeBased()
    .after(15 * 1000) // Run after 15 seconds
    .create();
}

function deletePhaseTriggersBy(functionName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function setupWeeklyTrigger() {
  // Delete existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'main') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a new weekly trigger
  ScriptApp.newTrigger("main")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SATURDAY)
    .atHour(9)
    .create();
  
  Logger.log("Weekly trigger set up successfully.");
}