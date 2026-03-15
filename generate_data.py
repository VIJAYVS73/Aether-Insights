import random
import uuid
from datetime import datetime, timedelta
import csv

# Set seed for reproducibility
random.seed(42)

products = [
    "iPhone 14", "iPhone 13", "Samsung Galaxy S23", "Samsung Galaxy S22", 
    "OnePlus 11", "OnePlus 10", "Redmi Note 13", "Realme Narzo",
    "Dell Inspiron Laptop", "HP Pavilion Laptop", "Lenovo ThinkPad",
    "Boat Earbuds", "Sony Headphones", "JBL Speaker",
    "Smart Watch", "Canon Camera", "Sony Headphones",
    "Nike Shoes", "Adidas Backpack", "Apple Watch"
]

categories = [
    "Mobiles", "Electronics", "Laptops", "Accessories", "Fashion", "Cameras"
]

periods_config = {
    "last_7_days": (7, 500, 1.0),
    "last_30_days": (30, 1000, 0.9),
    "last_90_days": (90, 1500, 0.8),
    "last_6_months": (180, 2000, 0.7),
    "last_1_year": (365, 3000, 0.6)
}

def generate_dataset(selected_period):
    """Generate dataset for a specific period"""
    
    if selected_period not in periods_config:
        raise ValueError(f"Unknown period: {selected_period}")
    
    days, count, weight = periods_config[selected_period]
    rows = []
    now = datetime.now()

    for i in range(count):
        date = now - timedelta(days=random.randint(0, days))
        
        rows.append({
            "product_id": str(uuid.uuid4())[:8],
            "product_name": random.choice(products),
            "category": random.choice(categories),
            "price": random.randint(500, 80000),
            "rating": round(random.uniform(3.0, 5.0), 1),
            "discount_percent": random.randint(5, 60),
            "date": date.strftime("%Y-%m-%d %H:%M:%S.%f"),
            "period": selected_period
        })

    return rows

def generate_all_data():
    """Generate data for all periods and combine into one CSV"""
    
    all_data = []
    
    for period in periods_config.keys():
        print(f"Generating data for {period}...")
        rows = generate_dataset(period)
        all_data.extend(rows)
        print(f"  Generated {len(rows)} records")
    
    # Sort by date (convert to datetime for sorting)
    all_data.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d %H:%M:%S.%f"), reverse=True)
    
    # Save to CSV
    output_path = "flipkart_synthetic_5000_products.csv"
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ["product_id", "product_name", "category", "price", "rating", "discount_percent", "date", "period"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        writer.writerows(all_data)
    
    print(f"\n✓ Generated CSV file: {output_path}")
    print(f"✓ Total records: {len(all_data)}")
    print(f"\nData breakdown by period:")
    
    for period in periods_config.keys():
        count = sum(1 for row in all_data if row["period"] == period)
        print(f"  {period}: {count} records")

if __name__ == "__main__":
    generate_all_data()
