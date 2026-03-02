const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ===================== MONGODB CONNECT ===================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

/* ===================== SCHEMAS ===================== */
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  package: String,
  message: String,
  time: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Contact = mongoose.model("Contact", contactSchema);

/* ===================== TEST ROUTE ===================== */
app.get("/", (req, res) => {
  res.send("Backend successfully running 🚀");
});

/* ===================== SIGN UP ===================== */
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    await User.create({ username, email, password });

    res.json({ message: "Sign Up successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== SIGN IN ===================== */
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ message: "Sign In successful" });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== CONTACT / BOOKING ===================== */
app.post("/contact", async (req, res) => {
  try {
    const { name, email, package, message } = req.body;

    await Contact.create({ name, email, package, message });

    res.json({ message: "Message received and saved successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== SERVER START ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server started on port " + PORT);
});