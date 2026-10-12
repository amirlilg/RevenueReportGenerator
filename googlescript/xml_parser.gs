// XmlService builds a full DOM and took ~6 min on an 11 MB backup, so scan the raw text instead.
function parseSmsBackup(file) {
  Logger.log("Parsing XML content...");
  var xml = file.getBlob().getDataAsString('UTF-8');

  // Quoted attribute values may legally contain '>' so they are matched as units.
  var smsRegex = /<sms\b((?:[^>"]|"[^"]*")*?)\/?>/g;
  var attrRegex = /([\w:-]+)="([^"]*)"/g;
  var data = [];
  var total = 0;
  var match;

  while ((match = smsRegex.exec(xml)) !== null) {
    total++;
    var attrs = {};
    var attrMatch;
    attrRegex.lastIndex = 0;
    while ((attrMatch = attrRegex.exec(match[1])) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }

    var body = decodeXmlEntities(attrs.body || '');
    // Only deposit messages matter downstream; skipping the rest keeps the temp sheet small.
    if (extractDepositAmountRefah(body) === null) continue;

    data.push([
      attrs.date || '',
      decodeXmlEntities(attrs.readable_date || ''),
      decodeXmlEntities(attrs.address || ''),
      decodeXmlEntities(attrs.contact_name || ''),
      attrs.type === "1" ? "Received" : "Sent",
      body
    ]);
  }

  Logger.log("Successfully parsed XML content. Found " + total + " SMS entries, kept " + data.length + " deposit candidates.");
  return data;
}

function decodeXmlEntities(text) {
  if (text.indexOf('&') === -1) return text;
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|lt|gt|quot|apos|amp);/g, function(m, ent) {
    switch (ent) {
      case 'lt': return '<';
      case 'gt': return '>';
      case 'quot': return '"';
      case 'apos': return "'";
      case 'amp': return '&';
    }
    var code = ent.charAt(1) === 'x' ? parseInt(ent.substring(2), 16) : parseInt(ent.substring(1), 10);
    return String.fromCodePoint(code);
  });
}