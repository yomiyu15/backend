const fs = require("fs");
const path = require("path");
const db = require("../db");
const multer = require("multer");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Helper function to create the folder if it doesn't exist
const ensureDirectoryExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Helper function to delete a file or folder recursively
const deleteItemRecursive = (itemPath) => {
  const stats = fs.lstatSync(itemPath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(itemPath);
    files.forEach((file) => {
      const filePath = path.join(itemPath, file);
      deleteItemRecursive(filePath);
    });
    fs.rmdirSync(itemPath);
  } else {
    fs.unlinkSync(itemPath);
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { parentFolderPath, folderName } = req.body;
    const newFolderPath = path.join(
      UPLOADS_DIR,
      parentFolderPath || "",
      folderName
    );

    ensureDirectoryExists(newFolderPath);

    await db.query("INSERT INTO folders (name, path) VALUES ($1, $2)", [
      folderName,
      newFolderPath,
    ]);

    res
      .status(201)
      .json({ message: "Folder created successfully", path: newFolderPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    res
      .status(500)
      .json({
        message: "Error creating folder",
        error: error.message || error,
      });
  }
};

// Get the folder structure
exports.getFolderStructure = async (req, res) => {
  const readFolderStructure = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    return items.map((item) => {
      const fullPath = path.join(dirPath, item);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      return {
        name: item,
        path: fullPath,
        type: isDirectory ? "folder" : "file",
        children: isDirectory ? readFolderStructure(fullPath) : [],
      };
    });
  };

  try {
    const folderStructure = readFolderStructure(UPLOADS_DIR);
    res.json(folderStructure);
  } catch (error) {
    console.error("Error fetching folder structure:", error);
    res
      .status(500)
      .json({
        message: "Error fetching folder structure",
        error: error.message || error,
      });
  }
};

exports.renameItem = async (req, res) => {
  const { itemPath, newName } = req.body;

  try {
    if (!itemPath || !newName) {
      return res.status(400).json({ message: "Item path and new name are required" });
    }

    // Normalize path format (handle Windows backslashes)
    const oldPath = path.resolve(itemPath).replace(/\\/g, '/');
    const newPath = path.resolve(path.dirname(itemPath), newName).replace(/\\/g, '/');

    console.log("Old Path:", oldPath);
    console.log("New Path:", newPath);

    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ensure new path doesn't already exist
    if (fs.existsSync(newPath)) {
      return res.status(400).json({ message: "A folder or file with the new name already exists" });
    }

    // Renaming the folder or file
    fs.renameSync(oldPath, newPath);

    // Optionally update the database if necessary
    await db.query("UPDATE folders SET name = $1 WHERE path = $2", [newName, oldPath]);

    res.status(200).json({ message: "Item renamed successfully", newPath });
  } catch (error) {
    console.error("Error renaming item:", error);
    res.status(500).json({ message: "Error renaming item", error: error.message || error });
  }
};


// Delete a file or folder
exports.deleteItem = async (req, res) => {
  const { itemPath } = req.body;

  try {
    if (!itemPath) {
      return res.status(400).json({ message: "Item path is required" });
    }

    const itemFullPath = path.resolve(itemPath);

    if (!fs.existsSync(itemFullPath)) {
      return res.status(404).json({ message: "Item not found" });
    }

    deleteItemRecursive(itemFullPath);

    // Optionally delete from the database
    await db.query("DELETE FROM folders WHERE path = $1", [itemFullPath]);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res
      .status(500)
      .json({ message: "Error deleting item", error: error.message || error });
  }
};
