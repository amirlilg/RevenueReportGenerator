function findLatestXmlFile() {
  Logger.log("Finding the latest XML file...");
  var folderId = '1xJXz2wdp1GwgkpPdNvr6eJwzV9n1ELkK'; // Your main folder ID
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var latestFile = null;
  var latestDate = new Date(0); // Initialize with the earliest possible date
  
  while (files.hasNext()) {
    var file = files.next();
    var fileName = file.getName();
    
    if (fileName.endsWith('.xml')) {
      var fileDate = file.getDateCreated();
      if (fileDate > latestDate) {
        latestDate = fileDate;
        latestFile = file;
      }
    }
  }
  
  if (latestFile) {
    Logger.log("Latest XML file found: " + latestFile.getName());
  } else {
    Logger.log("No XML files found in the folder.");
  }
  
  return latestFile;
}

function moveFileToSubfolder(file, subfolderName) {
  var folderId = '1xJXz2wdp1GwgkpPdNvr6eJwzV9n1ELkK'; // Your main folder ID
  var folder = DriveApp.getFolderById(folderId);
  
  // Create or get the subfolder
  var subfolder;
  var subfolders = folder.getFoldersByName(subfolderName);
  if (subfolders.hasNext()) {
    subfolder = subfolders.next();
  } else {
    subfolder = folder.createFolder(subfolderName);
  }
  
  // Move the file to the subfolder
  file.moveTo(subfolder);
  Logger.log("Moved file to subfolder: " + subfolder.getName());
}