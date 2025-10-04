// scripts/seedExperiences.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import Experience from "../api/models/Experience.js"; // adjust path to your model

dotenv.config();
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/airbnb-clone";

/* ---------- Provided images, categories & locations ---------- */
const experienceImages = [
  "https://plus.unsplash.com/premium_photo-1663054309676-bb9d31c56f72?w=1200&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1663047386229-637af57cecfe?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1627890285103-aabd37bb0d65?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1588600878108-578307a3cc9d?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1517778991803-3fa8c9341083?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682687219356-e820ca126c92?w=1200&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1716999413660-cd854b6d6382?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1530825894095-9c184b068fcb?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682686579688-c2ba945eda0e?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535309882249-5dd08aa4561f?w=1200&auto=format&fit=crop&q=60",
  "https://plus.unsplash.com/premium_photo-1664297618679-c0c0298ce3f7?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1586936893354-362ad6ae47ba?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1683009427513-28e163402d16?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1682687221363-72518513620e?w=1200&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1690465529054-c2ff867e5c77?w=1200&auto=format&fit=crop&q=60"
];

const categories = [
  "Adventure", "Food & Drinks", "Culture", "Nature",
  "Wellness", "Photography", "Wildlife", "Water Sports"
];

const locations = [
  "Jaipur, Rajasthan", "Manali, Himachal Pradesh", "Goa, India",
  "Hyderabad, Telangana", "Jaisalmer, Rajasthan", "Mumbai, Maharashtra",
  "Kerala, India", "Delhi, India", "Leh, Ladakh",
  "Varanasi, Uttar Pradesh", "Pondicherry, India", "Rishikesh, Uttarakhand"
];

/* ---------- small helpers ---------- */
function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
function pickRandom(arr, n = 1) {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  return n === 1 ? copy[0] : copy.slice(0, n);
}
function getRandomImages(count = 3) {
  return pickRandom(experienceImages, count);
}
function randomBool(p = 0.5) {
  return Math.random() < p;
}

/* ---------- domain-specific generators ---------- */
function getDurationHours() {
  // common experiences: 1 to 10 hours (some multi-day)
  const hours = faker.number.int({ min: 1, max: 10 });
  return { hours, label: hours >= 24 ? `${Math.round(hours / 24)} days` : `${hours} hours` };
}

function generateItinerary(durationHours) {
  const steps = [];
  const stepCount = Math.min(6, Math.max(2, Math.ceil(durationHours / 1.5)));
  for (let i = 0; i < stepCount; i++) {
    steps.push({
      title: faker.lorem.words(faker.number.int({ min: 2, max: 5 })),
      description: faker.lorem.sentence(),
      approxMinutes: Math.round((durationHours * 60) / stepCount)
    });
  }
  return steps;
}

function generateReviews(min = 6, max = 120) {
  const count = faker.number.int({ min, max });
  return Array.from({ length: count }).map(() => ({
    user: {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      avatar: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`
    },
    rating: faker.number.int({ min: 3, max: 5 }),
    title: faker.lorem.sentence(3),
    comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
    createdAt: new Date(Date.now() - faker.number.int({ min: 0, max: 365 }) * 24 * 60 * 60 * 1000).toISOString()
  }));
}

function ratingSummaryFrom(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = reviews.reduce((s, r) => {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
    return s + r.rating;
  }, 0);
  const avg = reviews.length ? +(total / reviews.length).toFixed(1) : 5.0;
  return { avg, counts, totalReviews: reviews.length };
}

function generateAvailability() {
  // random upcoming dates within next 90 days (ISO strings)
  const n = faker.number.int({ min: 6, max: 20 });
  const dates = [];
  for (let i = 0; i < n; i++) {
    const daysFromNow = faker.number.int({ min: 1, max: 90 });
    const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString());
  }
  return [...new Set(dates)].sort();
}

/* ---------- Main generator ---------- */
function generateExperienceObject() {
  const category = pickRandom(categories);
  const location = pickRandom(locations);
  const city = location.split(",")[0];
  const duration = getDurationHours();
  const photosCount = faker.number.int({ min: 1, max: 5 });
  const photos = getRandomImages(photosCount);
  const reviews = generateReviews();
  const ratingSummary = ratingSummaryFrom(reviews);

  const hostName = `${faker.name.firstName()} ${faker.name.lastName()}`;

  return {
    title: `${category} • ${faker.lorem.words(faker.number.int({ min: 2, max: 5 }))}`,
    slug: slugify(`${category} ${city} ${faker.word.adjective() || faker.lorem.word()}`),
    shortTitle: `${category} in ${city}`,
    description: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
    location,
    coordinates: {
      lat: parseFloat(faker.location.latitude()),
      lng: parseFloat(faker.location.longitude())
    },
    category,
    tags: pickRandom(["local-favorite", "family-friendly", "offbeat", "romantic", "thrilling", "photo-friendly", "seasonal"], faker.number.int({ min: 1, max: 3 })),
    price: faker.number.int({ min: 500, max: 8000 }),
    currency: "INR",
    duration: duration.label,
    durationHours: duration.hours,
    maxGuests: faker.number.int({ min: 2, max: 20 }),
    minAge: faker.number.int({ min: 0, max: 16 }) > 12 ? 12 : 0, // sometimes child-friendly
    cancellationPolicy: pickRandom(["Flexible", "Moderate", "Strict"]),
    languages: pickRandom(["English", "Hindi", "Tamil", "Telugu", "French", "Spanish"], faker.number.int({ min: 1, max: 2 })),
    photos,
    coverPhoto: photos[0],
    amenities: {
      snacksProvided: randomBool(0.4),
      transportIncluded: randomBool(0.25),
      ticketsIncluded: randomBool(0.15),
      wheelchairAccessible: randomBool(0.12),
      kidFriendly: randomBool(0.35)
    },
    host: {
      name: hostName,
      avatar: `https://i.pravatar.cc/150?img=${faker.number.int({ min: 1, max: 70 })}`,
      bio: faker.lorem.sentences(2),
      isSuperhost: randomBool(0.12)
    },
    itinerary: generateItinerary(duration.hours),
    reviews, // full review array
    rating: ratingSummary.avg,
    reviewsCount: ratingSummary.totalReviews,
    ratingBreakdown: ratingSummary.counts,
    availability: generateAvailability(),
    highlights: pickRandom([
      "Local expert guide",
      "Small group (max 12)",
      "All equipment provided",
      "Family friendly",
      "Photographer on request",
      "All-ages welcome"
    ], faker.number.int({ min: 1, max: 2 })),
    meetingPoint: `${faker.address.streetAddress()}, ${city}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/* ---------- DB seeding logic ---------- */
async function seedExperiences(num = 60) {
  try {
    await mongoose.connect(MONGO_URL, { dbName: "airbnb-clone" });
    console.log("Connected to MongoDB:", MONGO_URL);

    await Experience.deleteMany();
    console.log("Old experiences removed");

    const docs = Array.from({ length: num }).map(() => generateExperienceObject());
    await Experience.insertMany(docs, { ordered: false });
    console.log(`${num} mock experiences inserted`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (err) {
    console.error("Error seeding experiences:", err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(1);
  }
}

/* Run */
seedExperiences(60);
