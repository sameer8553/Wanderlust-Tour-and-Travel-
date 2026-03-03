require("dotenv").config();
const express = require("express");   
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ STRONG CORS CONFIG - Sab kuch allow
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ OPTIONS pre-flight handle karein
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== MONGODB CONNECT ===================== */
console.log("⏳ Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
  });

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

/* ===================== HEALTH CHECK ===================== */
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        mongo: mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString()
    });
});

/* ===================== SIGN UP ===================== */
app.post("/signup", async (req, res) => {
    console.log("📝 Signup request received:", req.body?.email);
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        await User.create({ username, email, password });
        console.log("✅ User created:", email);
        res.json({ message: "Sign Up successful" });

    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ===================== SIGN IN ===================== */
app.post("/signin", async (req, res) => {
    console.log("🔑 Signin request received:", req.body?.email);
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (user) {
            console.log("✅ Signin successful:", email);
            res.json({ message: "Sign In successful" });
        } else {
            console.log("❌ Invalid credentials:", email);
            res.status(400).json({ message: "Invalid credentials" });
        }

    } catch (err) {
        console.error("❌ Signin error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ===================== CONTACT ===================== */
app.post("/contact", async (req, res) => {
    console.log("📧 Contact request received:", req.body?.email);
    try {
        const { name, email, package: pkg, message } = req.body;

        await Contact.create({ name, email, package: pkg, message });
        console.log("✅ Contact saved:", email);
        res.json({ message: "Message received and saved successfully" });

    } catch (err) {
        console.error("❌ Contact error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ===================== 404 HANDLER ===================== */
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

/* ===================== SERVER START ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("🚀 Server started on port " + PORT);
    console.log("📝 CORS: All origins allowed");
    console.log("🔗 Test: https://wanderlust-backend-uq67.onrender.com");
    console.log("🔍 Health check: /health");
});