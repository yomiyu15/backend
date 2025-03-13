const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

exports.uploadFile = async (req, res) => {
  try {
    console.log("Request Body:", req.body);  // Logs incoming form data
    console.log("Uploaded File:", req.file); // Logs the file object

    const { folderPath } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadPath = path.join(UPLOADS_DIR, folderPath, file.originalname);

    // Ensure the folder exists
    if (!fs.existsSync(path.dirname(uploadPath))) {
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    }

    // Move the file to the desired location
    fs.renameSync(file.path, uploadPath);

    return res.status(200).json({ message: "File uploaded successfully", path: uploadPath });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Error uploading file", error: error.message });
  }
};

