import express from "express";
import { getAllServices, getServiceById } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/services", getAllServices);
// router.post("/services", createService);
router.get("/services/:id", getServiceById); 

export default router;
