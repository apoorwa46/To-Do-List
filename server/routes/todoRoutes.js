



import express from "express";
import Todo from "../models/Todo.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all todos for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }); // ✅ use req.userId
    res.json(todos);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching todos", error: err.message });
  }
});

// Add a new todo
router.post("/", auth, async (req, res) => {
  try {
    const todo = await Todo.create({
      userId: req.userId, // ✅ use req.userId
      title: req.body.title,
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ msg: "Error creating todo", error: err.message });
  }
});

// Update (mark complete / edit)
router.put("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // ✅ use req.userId
      { $set: req.body },
      { new: true }
    );
    if (!todo) return res.status(404).json({ msg: "Todo not found" });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ msg: "Error updating todo", error: err.message });
  }
});

// Delete todo
router.delete("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ✅ use req.userId
    });
    if (!todo) return res.status(404).json({ msg: "Todo not found" });
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting todo", error: err.message });
  }
});

export default router;
