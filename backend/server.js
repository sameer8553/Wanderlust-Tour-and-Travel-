const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

/* ===================== MONGODB CONNECT (FIXED) ===================== */
mongoose.connect("mongodb://127.0.0.1:27017/myTourDB")
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
  res.send("Backend successfully running");
});

/* ===================== SIGN UP ===================== */
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("📝 Sign Up attempt:", email);

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    await User.create({ username, email, password });
    console.log("✅ Sign Up successful:", email);
    res.json({ message: "Sign Up successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================== SIGN IN ===================== */
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log("📝 Sign In attempt:", email);

  const user = await User.findOne({ email, password });
  if (user) {
    console.log("✅ Sign In successful:", email);
    res.json({ message: "Sign In successful" });
  } else {
    console.log("❌ Invalid credentials:", email);
    res.status(400).json({ message: "Invalid credentials" });
  }
});

/* ===================== CONTACT / BOOKING ===================== */
app.post("/contact", async (req, res) => {
  const { name, email, package, message } = req.body;

  console.log("📩 New Booking:");
  console.log(name, email, package, message);

  await Contact.create({ name, email, package, message });
  res.json({ message: "Message received and saved successfully" });
});

/* ===================== SERVER START ===================== */
app.listen(5000, () => {
  console.log("🚀 Server started on port 5000");
});

