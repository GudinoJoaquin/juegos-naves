import express from "express";
import { getUsers, postUsers } from "../controllers/spaceInvaders.js";

const router = express.Router();

router.get("/users", getUsers);
router.post("/users", postUsers);

export default router;
