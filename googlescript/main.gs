function main() {
  Logger.log("Starting main function...");
  
  // Find the latest XML file
  var latestFile = findLatestXmlFile();
  if (!latestFile) {
    Logger.log("No XML files found in the folder.");
    return;
  }
  
  Logger.log("Processing latest file: " + latestFile.getName());
  
  // Parse the XML file
  var data = parseSmsBackup(latestFile);
  
  // Process the data
  var result = processBankData(data);
  
  // Generate the report
  generateReport(result, latestFile.getName());
  
  Logger.log("Main function completed.");
}

function setupWeeklyTrigger() {
  // Delete existing triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Create a new weekly trigger
  ScriptApp.newTrigger("main")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SATURDAY) // Runs every Saturday
    .atHour(9) // Runs at 9 AM
    .create();
  
  Logger.log("Weekly trigger set up successfully.");
}