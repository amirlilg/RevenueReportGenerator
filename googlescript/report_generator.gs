function generateReport(result, fileName) {
  Logger.log("Generating report...");
  
  // Create the Google Sheets report
  var sheetName = 'Report_' + fileName.replace('.xml', '');
  Logger.log("Creating Google Sheets report: " + sheetName);
  var spreadsheet = SpreadsheetApp.create(sheetName);
  var sheet = spreadsheet.getActiveSheet();
  
  // Write headers
  sheet.appendRow(["Date", "Readable Date", "Address", "Contact Name", "Type", "Body", "Deposit Amount", "Month"]);
  
  // Write filtered data in batches to improve performance
  Logger.log("Writing " + result.filteredData.length + " rows to report...");
  var batchSize = 1000;
  for (var i = 0; i < result.filteredData.length; i += batchSize) {
    var batch = result.filteredData.slice(i, Math.min(i + batchSize, result.filteredData.length));
    if (batch.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, batch.length, batch[0].length).setValues(batch);
      Logger.log("Wrote batch " + (Math.floor(i / batchSize) + 1) + " (" + batch.length + " rows)");
    }
  }
  
  Logger.log("All data written to report sheet.");
  
  // Write monthly income and deposit count
  var summarySheet = spreadsheet.insertSheet('Summary');
  summarySheet.appendRow(["Month", "Total Income", "Deposit Count"]);
  
  var summaryData = [];
  for (var month in result.monthlyIncome) {
    summaryData.push([month, result.monthlyIncome[month], result.monthlyDepositCount[month]]);
  }
  
  if (summaryData.length > 0) {
    summarySheet.getRange(2, 1, summaryData.length, 3).setValues(summaryData);
  }
  
  Logger.log("Summary sheet created with " + summaryData.length + " months.");
  
  // Create charts
  if (summaryData.length > 0) {
    var chart = summarySheet.newChart()
      .asColumnChart()
      .addRange(summarySheet.getRange("A1:C" + (summaryData.length + 1)))
      .setPosition(5, 5, 0, 0)
      .setOption('title', 'Monthly Income and Deposit Count')
      .setOption('hAxis', {title: 'Month'})
      .setOption('vAxis', {title: 'Amount / Count'})
      .build();
    
    summarySheet.insertChart(chart);
    Logger.log("Chart created successfully.");
  }
  
  // Move the report to the subfolder
  var spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
  moveFileToSubfolder(spreadsheetFile, 'Generated Reports');
  Logger.log("Report generation completed successfully.");
}