from generate_report import generate_report
from xml_to_csv import parse_sms_backup

import sys

if __name__ == "__main__":
    xml_file_path = sys.argv[1]
    output_csv_path = xml_file_path[:-len("xml")] + "csv"
    parse_sms_backup(xml_file_path, output_csv_path)
    generate_report(output_csv_path)
