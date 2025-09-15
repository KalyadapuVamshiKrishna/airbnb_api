import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import Place from "./models/Place.js";
import User from "./models/User.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

// ✅ House Images
const houseImages = [
  "https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=60",
];

// ✅ Interior Images
const interiorImages = [
  "https://plus.unsplash.com/premium_photo-1671269941569-7841144ee4e0?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=60",
];

// ✅ Helper: Get random interiors
function getRandomInteriors(count = 2) {
  return [...interiorImages].sort(() => 0.5 - Math.random()).slice(0, count);
}

// ✅ Perks
const perksOptions = [
  "WiFi",
  "Free Parking",
  "Pool",
  "Air Conditioning",
  "Kitchen",
  "Pet Friendly",
  "Breakfast",
  "Work Desk",
  "Elevator",
];

// ✅ Indian Cities & States
const statesWithCities = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
  Telangana: ["Hyderabad", "Warangal", "Karimnagar"],
  TamilNadu: ["Chennai", "Coimbatore", "Madurai"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
  Delhi: ["New Delhi"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
};

// ✅ Titles (curated)
const propertyTitles = [
  "Luxury Beach Villa",
  "Cozy Homestay",
  "Modern City Apartment",
  "Rustic Heritage Haveli",
  "Peaceful Farm Retreat",
  "Elegant Serviced Apartment",
  "Hillside Cottage with View",
  "Boutique Stay in Old Town",
  "Traditional Kerala House",
  "Lakefront Holiday Home",
];

// ✅ Descriptions (curated)
const propertyDescriptions = [
  "A beautiful stay with modern amenities, close to popular attractions.",
  "Perfect for families and groups, with spacious interiors and a private garden.",
  "Enjoy a peaceful vacation in a home surrounded by nature and fresh air.",
  "Located in the heart of the city, with easy access to shopping and dining.",
  "A heritage-style stay with a blend of tradition and modern comfort.",
  "Wake up to stunning sunrise views and enjoy evenings on the terrace.",
  "Ideal for long stays with fully equipped kitchen and work desk.",
  "Pet-friendly and kid-friendly home, perfect for a relaxed vacation.",
  "Stay close to beaches and enjoy local seafood and culture.",
];

// ✅ Extra Info (curated)
const extraInfoOptions = [
  "No loud music after 10 PM.",
  "Smoking allowed only in outdoor areas.",
  "Pets are welcome with prior notice.",
  "Guests must show valid ID proof at check-in.",
  "Please switch off AC and lights when not in use.",
  "Breakfast available on request.",
];

function generateIndianAddress() {
  const state = faker.helpers.objectKey(statesWithCities);
  const city = faker.helpers.arrayElement(statesWithCities[state]);
  const street = `${faker.number.int({ min: 1, max: 200 })} ${faker.word.noun()} Street`;
  const pincode = faker.number.int({ min: 100000, max: 999999 });

  return {
    street,
    city,
    state,
    pincode,
    fullAddress: `${street}, ${city}, ${state}, ${pincode}`,
  };
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to DB");

    const user = await User.findOne();
    if (!user) {
      console.log("❌ No user found. Please create a user first.");
      return;
    }

    await Place.deleteMany();

    const places = Array.from({ length: 32 }).map(() => {
      const randomHouseImage = faker.helpers.arrayElement(houseImages);
      const randomPerks = faker.helpers.arrayElements(perksOptions, 3);
      const addressData = generateIndianAddress();

      return {
        owner: user._id,
        title: faker.helpers.arrayElement(propertyTitles),
        address: addressData.fullAddress,
        city: addressData.city,
        state: addressData.state,
        country: "India",
        pincode: addressData.pincode,
        photos: [randomHouseImage, ...getRandomInteriors(2)],
        description: faker.helpers.arrayElement(propertyDescriptions),
        perks: randomPerks,
        extraInfo: faker.helpers.arrayElement(extraInfoOptions),
        checkIn: 12,
        checkOut: 11,
        maxGuests: faker.number.int({ min: 2, max: 8 }),
        price: faker.number.int({ min: 1500, max: 12000 }),
        availableFrom: faker.date.future({ years: 0.1 }),
        availableTo: faker.date.future({ years: 0.5 }),
      };
    });

    await Place.insertMany(places);
    console.log("✅ 30 curated Indian-style places seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
