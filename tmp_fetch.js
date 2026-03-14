import fs from 'fs';

async function fetchAmazonData() {
  const apiKey = '9be45be4c5msh5c67015a304c369p16157ajsn630dbfb5e362';
  
  console.log("Fetching Product Details...");
  const detailsRes = await fetch('https://real-time-amazon-data.p.rapidapi.com/product-details?asin=B07ZPKBL9V&country=US', {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  });
  const details = await detailsRes.json();
  fs.writeFileSync('details.json', JSON.stringify(details, null, 2));
  console.log("Product details saved to details.json");

  console.log("Fetching Product Reviews...");
  const reviewsRes = await fetch('https://real-time-amazon-data.p.rapidapi.com/product-reviews?asin=B00939I7EK&country=US&page=1&sort_by=TOP_REVIEWS&star_rating=ALL&verified_purchases_only=false&images_or_videos_only=false&current_format_only=false', {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  });
  const reviews = await reviewsRes.json();
  fs.writeFileSync('reviews.json', JSON.stringify(reviews, null, 2));
  console.log("Product reviews saved to reviews.json");
}

fetchAmazonData().catch(console.error);
