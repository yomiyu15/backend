const fs = require("fs");
const path = require("path");
const db = require("../db");
exports.getFaq = async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM faq");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching FAQ entries:", error);
      res.status(500).json({ message: "Error fetching FAQ entries", error: error.message || error });
    }
  };
  
  // Add a new FAQ entry
  exports.addFaq = async (req, res) => {
    const { question, answer } = req.body;
  
    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }
  
    try {
      const result = await db.query(
        "INSERT INTO faq (question, answer) VALUES ($1, $2) RETURNING *",
        [question, answer]
      );
      res.status(201).json({ message: "FAQ added successfully", faq: result.rows[0] });
    } catch (error) {
      console.error("Error adding FAQ:", error);
      res.status(500).json({ message: "Error adding FAQ", error: error.message || error });
    }
  };
  
  // Delete an FAQ entry
  exports.deleteFaq = async (req, res) => {
    const { id } = req.body;
  
    if (!id) {
      return res.status(400).json({ message: "FAQ ID is required" });
    }
  
    try {
      const result = await db.query("DELETE FROM faq WHERE id = $1 RETURNING *", [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "FAQ not found" });
      }
  
      res.status(200).json({ message: "FAQ deleted successfully", deletedFaq: result.rows[0] });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Error deleting FAQ", error: error.message || error });
    }
  };