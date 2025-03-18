function extractDepositAmountRefah(body) {
  Logger.log("Extracting deposit amount from SMS body...");
  var match = body.match(/کارت([\d,]+)\+/);
  if (match) {
    Logger.log("Deposit amount found: " + match[1]);
    return parseInt(match[1].replace(/,/g, ''));
  }
  Logger.log("No deposit amount found in this SMS.");
  return null;
}

function processBankData(data) {
  Logger.log("Processing bank data...");
  var filteredData = [];
  var monthlyIncome = {};
  var monthlyDepositCount = {};
  
  data.forEach(function(row) {
    var depositAmount = extractDepositAmountRefah(row[5]);
    if (depositAmount !== null && (depositAmount === 2000000 || depositAmount === 3000000)) {
      var date = new Date(parseInt(row[0]));
      var monthYear = Utilities.formatDate(date, 'GMT', 'yyyy-MM');
      
      if (!monthlyIncome[monthYear]) {
        monthlyIncome[monthYear] = 0;
        monthlyDepositCount[monthYear] = 0;
      }
      
      monthlyIncome[monthYear] += depositAmount;
      monthlyDepositCount[monthYear] += 1;
      
      filteredData.push(row.concat([depositAmount, monthYear]));
    }
  });
  
  Logger.log("Successfully processed bank data. Filtered " + filteredData.length + " deposit entries.");
  return { filteredData: filteredData, monthlyIncome: monthlyIncome, monthlyDepositCount: monthlyDepositCount };
}