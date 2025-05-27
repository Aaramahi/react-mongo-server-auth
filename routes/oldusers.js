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
    res.status(500).json({ message: `Error feching users, ${error}` });
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

router.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({
        message: `User with ID ${req.params.id} not found`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: `Error feching users, ${error}` });
  }
});

// router.post("/api/users/", async (req, res) => {
//   const newUser = new User({
//     username: req.body.username,
//     password: req.body.password,
//     biodata: req.body.biodata,
//     jobRole: req.body.jobRole
//   });

//   try {
//     const savedUser = await newUser.save();
//     res.status(200).json(savedUser);
//   } catch (error) {
//     res.status(400).json({ message: `Error creating new user: ${error}` });
//   }
// });

router.post("/api/users",async(req,res)=>{
  const{username,password,biodata,jobRole}=req.body;

  try{
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    console.log(hashedPassword);

    const newUser= new User({
      username,
      password:hashedPassword,
      biodata,
      jobRole:jobRole,
    });

    const savedUser=await newUser.save();
    res.status(200).json(savedUser);
  }catch(error){
    res.status(400).json({message:`Error creating new user:${error}`});
  }
})


export default router;
