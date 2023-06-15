const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseName = req.body.caseName;
    console.log(caseName);
    const caseFolder = `archive/${caseName}`;
    // Create the directory if it doesn't exist
    if (!fs.existsSync(caseFolder)) {
      fs.mkdirSync(caseFolder, { recursive: true });
    }
    cb(null, caseFolder);
  },
  filename: (req, file, cb) => {
    const caseName = req.body.caseName;
    const fileType = req.body.fileType;
    console.log(caseName);
    const fileName = `${caseName}_${fileType}.pdf`;
    cb(null, fileName);
  },
});

const uploadFiles = multer({
  storage: storage,
}).array("files", 5); // Maximum 5 files can be uploaded, adjust the number as needed

export const handleMultipleUploadFiles = function (req, res) {
  return new Promise(function (resolve, reject) {
    uploadFiles(req, res, function (error) {
      if (error) {
        reject(error);
      }

      const files = req.files || [];
      const body = req.body || {};

      const uploadResults = files.map((file) => ({ file, body }));

      resolve(uploadResults);
    });
  });
};

const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseName = req.body.caseName;
    console.log(caseName);
    const caseFolder = `archive/${caseName}`;
    // Create the directory if it doesn't exist
    if (!fs.existsSync(caseFolder)) {
      fs.mkdirSync(caseFolder, { recursive: true });
    }
    cb(null, caseFolder);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
});

app.post("/upload", upload.array("files"), (req, res) => {
  // Files have been uploaded and stored on the server
  console.log(req.files);

  // Process uploaded files or perform any additional operations

  res.status(200).json({ message: "Files uploaded successfully" });
});
