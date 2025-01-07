import pandas as pd
import re
import matplotlib.pyplot as plt


def generate_report(output_csv_path):
    # Example: Reading the CSV file (replace with your actual file path)
    df = pd.read_csv(output_csv_path)

    # Step 1: Convert `Date` column (UNIX timestamp in milliseconds) to datetime
    if "Date" in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], unit='ms')

    # Step 2: Convert `Readable Date` column (if available)
    if "Readable Date" in df.columns:
        df['Readable Date'] = pd.to_datetime(df['Readable Date'], format='%b %d, %Y %H:%M:%S')

    # Use the available date column for analysis
    if "Date" in df.columns:
        df['Parsed Date'] = df['Date']
    elif "Readable Date" in df.columns:
        df['Parsed Date'] = df['Readable Date']
    else:
        raise ValueError("No valid date columns found in the DataFrame.")

    # Step 3: Correctly extract the deposit amount (numeric value after "مبلغ :")
    def extract_deposit_amount(body):
        match = re.search(r'مبلغ\s*:\s*([\d,]+)\s*ریال', body)
        if match:
            # Remove commas for numeric conversion
            return int(match.group(1).replace(',', ''))
        return None

    df['Deposit Amount'] = df['Body'].apply(extract_deposit_amount)

    # Step 4: Filter rows with valid deposit amounts
    df_filtered = df[df['Deposit Amount'].notnull()]

    # Step 5: Generate a monthly income report
    df_filtered['Month'] = df_filtered['Parsed Date'].dt.to_period('M')
    monthly_income = df_filtered.groupby('Month')['Deposit Amount'].sum()

    # Plot the monthly income trend
    plt.figure(figsize=(10, 6))
    monthly_income.plot(kind='bar', color='skyblue')
    plt.title('Monthly Income Report', fontsize=16)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Total Deposited Amount (IRR)', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    # Step 6: Save the report to a CSV file (optional)
    monthly_income.to_csv('monthly_income_report.csv', index=True)

    # Optional: Display rows for a specific deposit amount
    specific_amount = 20000000  # Replace with your desired amount
    df_specific_amount = df_filtered[df_filtered['Deposit Amount'] == specific_amount]
    print(f"Deposits of {specific_amount} IRR:")
    print(df_specific_amount[['Parsed Date', 'Body', 'Deposit Amount']])


if __name__ == "__main__":
    xml_file_path = "xml_csv_files/sms-20250107084635.xml"
    output_csv_path = xml_file_path[:-len("xml")] + "csv"
    generate_report(output_csv_path)