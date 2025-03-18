function parseSmsBackup(file) {
  Logger.log("Parsing XML content...");
  var xmlContent = file.getBlob().getDataAsString();
  var root = XmlService.parse(xmlContent).getRootElement();
  var smsList = root.getChildren('sms');
  var data = [];
  
  smsList.forEach(function(sms) {
    var date = sms.getAttribute('date').getValue();
    var readableDate = sms.getAttribute('readable_date').getValue();
    var address = sms.getAttribute('address').getValue();
    var contactName = sms.getAttribute('contact_name').getValue();
    var type = sms.getAttribute('type').getValue() === "1" ? "Received" : "Sent";
    var body = sms.getAttribute('body').getValue();
    
    data.push([date, readableDate, address, contactName, type, body]);
  });
  
  Logger.log("Successfully parsed XML content. Found " + data.length + " SMS entries.");
  return data;
}