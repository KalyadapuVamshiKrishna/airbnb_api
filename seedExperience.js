import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import Experience from "./models/Experience.js";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

// ✅ Provided Experience Images
const experienceImages = [
  "https://plus.unsplash.com/premium_photo-1663054309676-bb9d31c56f72?w=600&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1663047386229-637af57cecfe?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1627890285103-aabd37bb0d65?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1588600878108-578307a3cc9d?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517778991803-3fa8c9341083?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682687219356-e820ca126c92?w=600&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1716999413660-cd854b6d6382?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1530825894095-9c184b068fcb?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682686579688-c2ba945eda0e?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535309882249-5dd08aa4561f?w=600&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1664297618679-c0c0298ce3f7?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1683009427513-28e163402d16?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682687221363-72518513620e?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1690465529054-c2ff867e5c77?w=600&auto=format&fit=crop&q=60"
];

// ✅ Categories for Experiences
const categories = [
  "Adventure", "Food & Drinks", "Culture", "Nature", "Wellness", "Photography", "Wildlife", "Water Sports"
];

// ✅ Locations in India
const locations = [
  "Jaipur, Rajasthan", "Manali, Himachal Pradesh", "Goa, India", "Hyderabad, Telangana",
  "Jaisalmer, Rajasthan", "Mumbai, Maharashtra", "Kerala, India", "Delhi, India",
  "Leh, Ladakh", "Varanasi, Uttar Pradesh", "Pondicherry, India", "Rishikesh, Uttarakhand"
];

// ✅ Function to pick random images
function getRandomImages(count = 3) {
  return [...experienceImages].sort(() => 0.5 - Math.random()).slice(0, count);
}

// ✅ Generate Random Duration (2 to 8 hours)
function getRandomDuration() {
  return `${faker.number.int({ min: 2, max: 8 })} hours`;
}

// ✅ Generate 50+ Experiences
function generateExperiences(num = 50) {
  return Array.from({ length: num }).map(() => {
    const category = faker.helpers.arrayElement(categories);
    const title = `${category} Experience in ${faker.location.city()}`;
    return {
      title,
      description: faker.lorem.sentences(2),
      location: faker.helpers.arrayElement(locations),
      price: faker.number.int({ min: 500, max: 5000 }),
      duration: getRandomDuration(),
      rating: Number((Math.random() * (5 - 4) + 4).toFixed(1)), // Between 4.0 and 5.0
      reviewsCount: faker.number.int({ min: 50, max: 1500 }),
      category,
      photos: getRandomImages(3),
    };
  });
}

async function seedExperiences() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    await Experience.deleteMany();
    console.log("Old experiences removed");

    const mockExperiences = generateExperiences(60); 
    await Experience.insertMany(mockExperiences);
    console.log("60 mock experiences inserted");

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding experiences:", error);
    mongoose.connection.close();
  }
}

seedExperiences();
