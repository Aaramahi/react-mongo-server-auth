import express from "express";
const router = express.Router();
import User from "../models/User.js";
import bcrypt from "bcryptjs";

router.get("/api/users/", async (req, res) => {
  try {
    const { limit } = req.query;
    const hasInvalidQuery = Object.keys(req.query).some(
      (key) => key !== "limit"
    );

    if (hasInvalidQuery) {
      return res
        .status(400)
        .json({ message: "Invalid query parameter/ give query as limit" });
    }

    if (!limit) {
      const allUsers = await User.find();
      return res.status(200).json(allUsers);
    }

    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(404).json({
        message: "query limit should be a number and it should be more than 0",
      });
    }

    const totalUsers = await User.countDocuments();

    if (parsedLimit > totalUsers) {
      return res
        .status(404)
        .json({ message: `There are only ${totalUsers} users` });
    }

    const limitedUsers = await User.find().limit(parsedLimit);
    return res.status(200).json(limitedUsers);
  } catch (error) {
    res.status(500).json({ message: `Error fetching users ${error}` });
  }
});

router.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res
        .status(404)
        .json({ message: `User with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error feching userss, ${error}` });
  }
});

router.delete("/api/users/:id", async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (deletedUser) {
    res.status(200).json({ message: `User with id ${req.params.id} deleted` });
  } else {
    res
      .status(404)
      .json({ message: `User with ID ${req.params.id} not found` });
  }
});

router.post("/api/users/", async (req, res) => {
  const { username, password, biodata, jobRole } = req.body;
  console.log(req.body);
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      biodata,
      jobRole,
    });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: ` Error creating a new user : ${error}` });
  }
});

router.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: `User ${username} not found` });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(404).json({ message: "invalid password" });

    res.status(200).json({ message: `login successfull`, user });
  } catch (error) {
    res.status(500).json({ message: `Login error ${error}` });
  }
});

router.put("/api/users/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res
        .status(400)
        .json({ message: `User with ID ${req.params.id} not found` });
    }
  } catch (error) {
    res.status(500).json({ message: `Error editing user ${error}` });
  }
});

export default router;
