const sampleListings = [
  {
    title: "Cozy Beachfront Villa",
    description: "Escape to this stunning beachfront cottage with panoramic ocean views and private beach access.",
    image: {
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=60",
      filename: "listing_beach",
    },
    price: 4500,
    pricingType: "both",
    hourlyPrice: 600,
    location: "Goa",
    country: "India",
    geometry: { lat: 15.2993, lon: 74.1240 },
  },
  {
    title: "Modern Mountain Chalet",
    description: "Rustic elegance in the heart of the mountains. Perfect for ski trips or quiet retreats.",
    image: {
      url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=60",
      filename: "listing_mountain",
    },
    price: 3200,
    pricingType: "night",
    hourlyPrice: null,
    location: "Manali",
    country: "India",
    geometry: { lat: 32.2432, lon: 77.1892 },
  },
  {
    title: "Downtown Penthouse & Photo Studio",
    description: "Spacious studio with natural lighting, ideal for commercial shoots, events, and overnight stays.",
    image: {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60",
      filename: "listing_studio",
    },
    price: 8500,
    pricingType: "hour",
    hourlyPrice: 1200,
    location: "Mumbai",
    country: "India",
    geometry: { lat: 19.0760, lon: 72.8777 },
  },
  {
    title: "Heritage Royal Haveli",
    description: "Experience authentic royal Rajasthani architecture with courtyards and rooftop dining.",
    image: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
      filename: "listing_haveli",
    },
    price: 6000,
    pricingType: "both",
    hourlyPrice: 800,
    location: "Jaipur",
    country: "India",
    geometry: { lat: 26.9124, lon: 75.7873 },
  },
  {
    title: "Eco-Friendly Farmhouse Retreat",
    description: "Surrounded by organic orchards and fresh air, offering serene countryside relaxation.",
    image: {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=60",
      filename: "listing_farm",
    },
    price: 2800,
    pricingType: "night",
    hourlyPrice: null,
    location: "Chandigarh",
    country: "India",
    geometry: { lat: 30.7333, lon: 76.7794 },
  },
];

module.exports = { data: sampleListings };