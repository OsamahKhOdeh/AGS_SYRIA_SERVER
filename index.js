import express from "express";
import mongoose from "mongoose";
import connect from "./config/db.js";
import { logRequest, setPoweredByHeader } from "./config/middleware.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

/* -------------------------------------------------------------------------- */
import archiveRoutes from "./routes/archiveRoutes/archiveRoutes.js";
/* -------------------------------------------------------------------------- */

import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import corsOptions from "./config/corsOptions.js";
import * as dotenv from "dotenv";
import { downloadArchiveFile } from "./controllers/ArchiveControllers/ArchiveControllers.js";

//import { errorHandler } from "./middleware/errorHandler.js";
dotenv.config();
const app = express();
console.log(process.env.NODE_ENV);
app.use(logger);

app.use(setPoweredByHeader);
app.use("/archive", express.static("archive"));

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
/* -------------------------------------------------------------------------- */
app.use("/archive", archiveRoutes);
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("App is running");
});

app.use(errorHandler);

const PORT = 5000;
connect()
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

mongoose.set("useFindAndModify", false);
