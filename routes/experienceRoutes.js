import express from "express";
import {
  createExperience,
  getAllExperiences,
  getExperienceById,
} from "../controllers/experienceController.js";

const router = express.Router();

router.post("/", createExperience);
router.get("/", getAllExperiences);
router.get("/:id", getExperienceById);

export default router;
