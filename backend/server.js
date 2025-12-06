const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes"); // NEW

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes); // NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Nivio Server started on PORT ${PORT}`));