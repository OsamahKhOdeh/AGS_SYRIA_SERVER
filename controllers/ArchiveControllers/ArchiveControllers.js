import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ArchiveDocument from "../../models/ArchiveDocument/ArchiveDocument.js";
import { caseStatus } from "../../config/caseStatus.js";
import { archiveFileType } from "../../config/archiveFileType.js";
import { handleSingleUploadFile } from "../../helpers/fileUploader.js";
import { handleSingleUploadFileUpdate } from "../../helpers/fileUploadUpdate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// // Set up storage configuration for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const caseName = req.body.caseName;
//     const caseFolder = `${__dirname}/archive/${caseName}`;
//     cb(null, caseFolder);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// // Create a multer instance with the storage configuration
// const upload = multer({ storage });

export const createArchive = async (req, res) => {
  console.log(req.file);
  try {
    const { caseName, caseDate, logisticEmployee } = req.body;
    const archiveObject = {
      caseName,
      caseDate,
      logisticEmployee,
      status: caseStatus.DRAFT,
      files: [
        {
          type: archiveFileType.PKL,
          uploaded: true,
          path: req.file.path,
          // path: path.dirname(path.resolve(__dirname, "..")) + "/archive/" + caseName + "/" + caseName + "_" + archiveFileType.PKL + ".pdf",
        },
      ],
    };
    console.log(archiveObject);
    const archive = await ArchiveDocument.create(archiveObject);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(201).json(archive);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 CRAETE_CASE                                */
/* -------------------------------------------------------------------------- */

export const addArchiveFile = async (req, res) => {
  console.log("ADDDDDDDDDD");
  try {
    const caseId = req.params.caseId;
    // const url = req.protocol + "://" + req.get("host");
    const { caseName, archiveEmployee } = req.body;
    const archiveDoc = await ArchiveDocument.findOne({ _id: caseId });
    if (!archiveDoc) {
      res.json({ error: "No such case" });
      return;
    }
    if (archiveDoc) {
      console.log("fOUND");
    }
    console.log(req.file);
    // archiveDoc.status = caseStatus.IN_PROGRESS;
    archiveDoc.archiveEmployee = archiveEmployee;
    let fileIndex = archiveDoc.files.findIndex((f) => f.type === req.body.fileType);
    if (fileIndex === -1) {
      archiveDoc.files.push({
        type: req.body.fileType,
        uploaded: true,
        path: req.file.path,
      });
    } else {
      archiveDoc.files[fileIndex].path = req.file.path;
    }

    if (archiveDoc.files.length > 2) {
      archiveDoc.status = caseStatus.IN_PROGRESS;
    }
    console.log("fOUND");

    archiveDoc.save();
    console.log(archiveDoc);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(201).json(archiveDoc);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                            ArchiveInvoiceNumber;                           */
/* -------------------------------------------------------------------------- */
export const addArchiveInvoiceNumber = async (req, res) => {
  console.log("INVOICEEEEEEEEEEE");
  try {
    const caseId = req.params.caseId;
    // const url = req.protocol + "://" + req.get("host");
    const { invoiceNumber, acountingEmployee } = req.body;
    const archiveDoc = await ArchiveDocument.findOne({ _id: caseId });
    if (!archiveDoc) {
      res.json({ error: "No such case" });
      return;
    }
    // archiveDoc.status = caseStatus.IN_PROGRESS;
    archiveDoc.acountingEmployee = acountingEmployee;
    archiveDoc.invoiceNumber = invoiceNumber;
    archiveDoc.status = caseStatus.COMPLETED;
    archiveDoc.save();
    console.log(archiveDoc);
    res.header("Access-Control-Allow-Origin", "*");
    res.status(201).json(archiveDoc);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

/* -------------------------------------------------------------------------- */

export const downloadArchiveFile = (req, res) => {
  console.log("JJJJJJJJJJJJJJJJJJJJJJ", req.query.type);
  const filePath = path.dirname(path.resolve(__dirname, "..")) + "/archive/" + req.params.caseName + "_" + req.query.type + ".pdf";
  console.log(path.dirname(path.resolve(__dirname, "..")));
  console.log(filePath);
  res.download(
    filePath,
    `${req.params.caseName}_${req.query.type}.pdf`, // Remember to include file extension
    (err) => {
      if (err) {
        res.send({
          error: err,
          msg: "Problem downloading the file",
        });
      }
    }
  );
};

export const getAllArchives = async (req, res) => {
  const status = req.params.status;
  try {
    let docs;
    if (status === "ALL") {
      docs = await ArchiveDocument.find().sort({ updatedAt: -1 }).exec();
    } else if (status === "DRAFT") {
      docs = await ArchiveDocument.find({ status: "DRAFT" }).sort({ updatedAt: -1 }).exec();
    } else if (status === "IN_PROGRESS") {
      docs = await ArchiveDocument.find({ status: "IN_PROGRESS" }).sort({ updatedAt: -1 }).exec();
    } else if (status === "COMPLETED") {
      docs = await ArchiveDocument.find({ status: "COMPLETED" }).sort({ updatedAt: -1 }).exec();
    } else {
      return res.status(400).json({ error: "Invalid status parameter" });
    }

    if (!docs || docs.length === 0) {
      //return res.status(404).json({ error: "No archives found" });
      return res.json([]);
    }

    return res.status(200).json(docs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addArchiveFiles = async (req, res) => {
  const { caseName, caseDate, archiveEmployee } = req.body;
  // console.log("OSAMA ", Object.values());
  var object = {};
  // req.body.files.forEach((value, key) => (object[key] = value));
  console.log(req.body.files[0]);

  //   if (fieldname === "caseName") {
  //     caseName = value;
  //   }
  // });

  //   const uniqueFilename = `${Date.now()}-${filename}`;

  //   // Create the directory if it does not exist
  //   const saveToDirectory = path.join(__dirname, "uploads", caseName);
  //   if (!fs.existsSync(saveToDirectory)) {
  //     fs.mkdirSync(saveToDirectory, { recursive: true });
  //   }

  //   const saveToPath = path.join(saveToDirectory, uniqueFilename);

  //   file.pipe(fs.createWriteStream(saveToPath));

  //   res.json({ filename: uniqueFilename });
  // });

  // let uploadResult;

  // try {
  //   uploadResult = await handleSingleUploadFile(req, res);
  // } catch (e) {
  //   return res.status(422).json({ errors: [e.message] });
  // }

  // const uploadedFile = uploadResult.file;

  // const { body } = uploadResult;

  // console.log({
  //   uploadResult,
  // });

  // console.log(req.body);
  //res.json({ msg: "op" });
  // try {
  //   // const url = req.protocol + "://" + req.get("host");
  //   const { caseName, caseDate, archiveEmployee } = req.body;
  //   const archiveObject = {
  //     caseName,
  //     caseDate,
  //     archiveEmployee,
  //     status: caseStatus.DRAFT,
  //     files: [
  //       {
  //         type: req.body.fileType,
  //         uploaded: true,
  //         path: "/archive/" + caseName + "/" + caseName + "_" + req.body.fileType,
  //       },
  //     ],
  //   };
  //   console.log(archiveObject);
  //   const archive = await ArchiveDocument.create(archiveObject);
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.status(201).json(archive);
  // } catch (error) {
  //   res.status(409).json({ message: error.message });
  // }
};

export default router;
