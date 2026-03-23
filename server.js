const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// MUST be before routes
app.use(express.json());

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Banking Transaction System Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});