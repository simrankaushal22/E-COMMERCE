import express from "express"
import { login, logout, register, reVerify, verify } from "../controllers/userControllers.js"
import { IsAuthenticated } from "../middleware/IsAuthenticated.js"

const router=express.Router()

router.post("/register",register)
router.post("/verify",verify)
router.post("/reverify",reVerify)
router.post("/login",login)
router.post("/logout", IsAuthenticated,logout)
export default router  