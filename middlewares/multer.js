import multer from "multer";

export const photosMiddleware = multer({ dest: "/tmp" });
