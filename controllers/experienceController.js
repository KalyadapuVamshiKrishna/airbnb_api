import Experience from "../models/Experience.js";

export const createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json(experience);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllExperiences = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let experiences = await Experience.find(query);

    if (sort === "price") {
      experiences = experiences.sort((a, b) => a.price - b.price);
    } else if (sort === "rating") {
      experiences = experiences.sort((a, b) => b.rating - a.rating);
    }

    res.json(experiences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    res.json(experience);
  } catch (err) {
    res.status(404).json({ message: "Experience not found" });
  }
};
