import pandas as pd
import re
import matplotlib.pyplot as plt

def parse_date_column(df: pd.DataFrame) -> pd.DataFrame:
    # Convert `Date` column (UNIX timestamp in milliseconds) to datetime
    if "Date" in df.columns:
        df['Date'] = pd.to_datetime(df['Date'], unit='ms')

    # Convert `Readable Date` column (if available)
    if "Readable Date" in df.columns:
        df['Readable Date'] = pd.to_datetime(df['Readable Date'], format='%b %d, %Y %I:%M:%S %p')

    # Use the available date column for analysis
    if "Date" in df.columns:
        df['Parsed Date'] = df['Date']
    elif "Readable Date" in df.columns:
        df['Parsed Date'] = df['Readable Date']
    else:
        raise ValueError("No valid date columns found in the DataFrame.")
    
    return df

def extract_deposit_amount_refah(body):
    """Extract deposit amounts from Refah bank messages."""
    match = re.search(r'کارت([\d,]+)\+', body)
    if match:
        # Remove commas and convert to integer
        return int(match.group(1).replace(',', ''))
    return None

def process_bank_data(df):
    """
    Filters deposit-related SMS data and calculates monthly metrics.

    Args:
        df (DataFrame): Input DataFrame with SMS transaction data.

    Returns:
        Tuple[DataFrame, Series, Series]: Filtered DataFrame, monthly income, and deposit counts.
    """
    # First, extract deposit amounts from the Body column
    df['Deposit Amount'] = df['Body'].apply(extract_deposit_amount_refah)
    
    # Remove rows where no deposit amount was found (None values)
    df = df.dropna(subset=['Deposit Amount'])

    # Filter rows where 'Deposit Amount' is EXACTLY 200,000 or 300,000
    df_filtered = df[
        (df['Deposit Amount'] == 2_000_000) | (df['Deposit Amount'] == 3_000_000)
    ]

    # Extract the month from the parsed date for aggregation
    df_filtered['Month'] = df_filtered['Parsed Date'].dt.to_period('M')

    # Calculate metrics by month
    monthly_income = df_filtered.groupby('Month')['Deposit Amount'].sum()
    monthly_deposit_count = df_filtered.groupby('Month').size()

    # Add a check to print some diagnostic information
    print("\nDiagnostic Information:")
    print(f"Total rows before filtering: {len(df)}")
    print(f"Total rows after filtering: {len(df_filtered)}")
    unique_amounts = df['Deposit Amount'].value_counts().head(10)
    print("\nMost common deposit amounts:")
    print(unique_amounts)

    return df_filtered, monthly_income, monthly_deposit_count

def generate_report_plots(monthly_income, monthly_deposit_count):
    """Generates plots for monthly income and deposit counts."""
    plt.figure(figsize=(14, 6))

    # Plot monthly income
    plt.subplot(1, 2, 1)
    monthly_income.plot(kind='bar', color='skyblue')
    plt.title('Monthly Income (IRR)', fontsize=16)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Total Deposited Amount (IRR)', fontsize=12)
    plt.xticks(rotation=45)

    # Plot monthly deposit counts
    plt.subplot(1, 2, 2)
    monthly_deposit_count.plot(kind='bar', color='lightgreen')
    plt.title('Monthly Deposit Count', fontsize=16)
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Number of Deposits', fontsize=12)
    plt.xticks(rotation=45)

    plt.tight_layout()
    # plt.show()
    plt.savefig('reports/report.png')

def save_reports(monthly_income, monthly_deposit_count, filtered_df):
    """Saves reports to CSV files."""
    monthly_income.to_csv('reports/monthly_income_report.csv', index=True)
    monthly_deposit_count.to_csv('reports/monthly_deposit_count_report.csv', index=True)
    filtered_df.to_csv('reports/filtered_deposit_data.csv', index=False)

def generate_report(output_csv_path):
    """Main function to generate the report."""
    # Read the CSV file
    df = pd.read_csv(output_csv_path)

    # Step 1: Parse dates
    df = parse_date_column(df)

    # Step 2: Process data to extract deposits
    df_filtered, monthly_income, monthly_deposit_count = process_bank_data(df)

    # Step 3: Generate plots
    generate_report_plots(monthly_income, monthly_deposit_count)

    # Step 4: Save reports
    save_reports(monthly_income, monthly_deposit_count, df_filtered)

    # Print summary for deposits
    print("\nMonthly Income Summary:")
    print(monthly_income)
    print("\nMonthly Deposit Count Summary:")
    print(monthly_deposit_count)

if __name__ == "__main__":
    csv_file_path = "files/sms-20250108183541.csv"
    generate_report(csv_file_path)