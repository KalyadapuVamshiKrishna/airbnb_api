import mongoose from "mongoose";
import dotenv from "dotenv";
import Experience from "./models/Experience.js";

dotenv.config();

async function checkExperiences() {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "airbnb-clone" });
    console.log("Connected to MongoDB");

    const count = await Experience.countDocuments();
    console.log(`Total experiences in database: ${count}`);

    if (count > 0) {
      const sample = await Experience.findOne();
      console.log("\nSample experience:");
      console.log(JSON.stringify(sample, null, 2));
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkExperiences();
