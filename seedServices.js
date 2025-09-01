import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "./models/Service.js";
import { servicesData } from "./data/servicesData.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    await Service.deleteMany();
    await Service.insertMany(servicesData);
    console.log("Services seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error(err));
