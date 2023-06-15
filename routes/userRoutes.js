import express from "express";
import { createNewUser, deleteUser, getAllUsers, updateUser} from "../controllers/userControllers.js";

const router = express.Router();

router.route('/')
.get(getAllUsers)
.post(createNewUser);

router.patch('/:id', updateUser);

router.delete('/:id', deleteUser);

export default router;
