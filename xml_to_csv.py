import xml.etree.ElementTree as ET
import csv

def parse_sms_backup(xml_file, output_csv):
    # Parse the XML file
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Open CSV file for writing
    with open(output_csv, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        
        # Write header row
        writer.writerow(["Date", "Readable Date", "Address", "Contact Name", "Type", "Body"])
        
        # Loop through each SMS entry
        for sms in root.findall('sms'):
            date = sms.get('date')
            readable_date = sms.get('readable_date')
            address = sms.get('address')
            contact_name = sms.get('contact_name')
            sms_type = "Received" if sms.get('type') == "1" else "Sent"
            body = sms.get('body')
            
            # Write to CSV
            writer.writerow([date, readable_date, address, contact_name, sms_type, body])

    print(f"Data successfully saved to {output_csv}")

# Example usage
if __name__=="__main__":
    xml_file_path = "xml_csv_files/sms-20250107084635.xml"
    output_csv_path = xml_file_path[:-len("xml")] + "csv"
    parse_sms_backup(xml_file_path, output_csv_path)