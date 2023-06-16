import express from "express";
import {
  addArchiveFile,
  addArchiveFiles,
  addArchiveInvoiceNumber,
  createArchive,
  downloadArchiveFile,
  getAllArchives,
} from "../../controllers/ArchiveControllers/ArchiveControllers.js";
import multer from "multer";
const router = express.Router();

import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Set up storage configuration for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const caseName = req.body.caseName;

//     const caseFolder = `C:\\AGS_SYRIA\\BACKEND\\archive`;
//     cb(null, caseFolder);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// Create a multer instance with the storage configuration

/* -------------------------------------------------------------------------- */
/*                                MULTER CONFIG                               */
/* -------------------------------------------------------------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("destoooooooooo");
    // const caseName = req.body.caseName;
    // const caseFolder = `archive/${caseName}`;
    // // Create the directory if it doesn't exist
    if (!fs.existsSync("archive")) {
      fs.mkdirSync("archive", { recursive: true });
    }
    // cb(null, caseFolder);
    cb(null, "./archive/");
  },
  filename: (req, file, cb) => {
    const caseName = req.body.caseName.replace(/ /g, "_");
    const fileType = req.body.fileType;
    console.log(caseName);
    const fileName = `${caseName}_${fileType}.pdf`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "application/pdf" || file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadStorage = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: fileFilter,
});

/* ---------------------------- MULTER CONFIG EDN --------------------------- */

router.post("/", uploadStorage.single("file"), createArchive);

router.get("/archive/:caseName", downloadArchiveFile);

router.patch("/:caseId", uploadStorage.single("file"), addArchiveFile);
router.patch("/invoice/:caseId", addArchiveInvoiceNumber);
//router.patch("/test", uploadStorage.none(), addArchiveFiles);
router.get("/:status", getAllArchives);

export default router;

/*
 supplier: [{ type: String }],
    buyer: [{ type: String }],
    consignee: [{ type: String }],
    notifyParty: [{ type: String }],
    portOfOrigin: [{ type: String }],
    finalDestination: [{ type: String }],
    incoterms: [{ type: String }],*/
