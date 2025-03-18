function generateReport(result, fileName) {
  Logger.log("Generating report...");
  
  // Create the Google Sheets report
  var sheetName = 'Report_' + fileName.replace('.xml', '');
  Logger.log("Creating Google Sheets report: " + sheetName);
  var spreadsheet = SpreadsheetApp.create(sheetName);
  var sheet = spreadsheet.getActiveSheet();
  
  // Write headers
  sheet.appendRow(["Date", "Readable Date", "Address", "Contact Name", "Type", "Body", "Deposit Amount", "Month"]);
  
  // Write filtered data
  result.filteredData.forEach(function(row) {
    sheet.appendRow(row);
  });
  
  // Write monthly income and deposit count
  var summarySheet = spreadsheet.insertSheet('Summary');
  summarySheet.appendRow(["Month", "Total Income", "Deposit Count"]);
  
  for (var month in result.monthlyIncome) {
    summarySheet.appendRow([month, result.monthlyIncome[month], result.monthlyDepositCount[month]]);
  }
  
  // Create charts
  var chart = summarySheet.newChart()
    .asColumnChart()
    .addRange(summarySheet.getRange("A2:C" + (Object.keys(result.monthlyIncome).length + 1)))
    .setPosition(5, 5, 0, 0)
    .build();
  
  summarySheet.insertChart(chart);
  Logger.log("Charts created successfully.");
  
  // Move the report to the subfolder
  var spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
  moveFileToSubfolder(spreadsheetFile, 'Generated Reports');
  Logger.log("Report generation completed successfully.");
}