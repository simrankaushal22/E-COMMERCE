import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv'
import connectDB  from './config/db.js'
import userRoute from './routes/userRoute.js'
dotenv.config();
const app = express();

//middleware
app.use(cors())// to connect backend & frontend 
app.use(express.json()) //lets your server read data sent from frontend (like forms or API requests).

app.use("/api/v1/user",userRoute)

app.get("/", (req, res) => {
  res.send("Server running ");
});
connectDB();

app.listen(3100, () => {
  console.log("Server running on port 3100");
});