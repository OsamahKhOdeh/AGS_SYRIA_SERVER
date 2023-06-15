import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseName = req.body.caseName;
    console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");

    console.log(req);
    console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");

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
const uploadFile = multer({
  storage: storage,
}).single("file");

export const handleSingleUploadFileUpdate = function (req, res) {
  return new Promise(function (resolve, reject) {
    uploadFile(req, res, function (error) {
      if (error) {
        reject(error);
      }

      resolve({ file: req.file, body: req.body });
    });
  });
};
