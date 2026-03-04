require("dotenv").config();
const express = require("express");   
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ SIMPLE CORS - '* ' ki jagah normal
app.use(cors());
app.use(express.json());

/* ===================== MONGODB CONNECT ===================== */
console.log("⏳ Connecting to MongoDB...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
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
        mongo: mongoose.connection.readyState === 1 
    });
});

/* ===================== SIGN UP ===================== */
app.post("/signup", async (req, res) => {
    console.log("📝 Signup request");
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
    console.log("🔑 Signin request");
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


/* ===================== BOOKING SCHEMA ===================== */
// ✅ Yeh tumhara ALAG register hai Booking ke liye
const bookingSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    packageName: { type: String, required: true },
    packagePrice: { type: String, required: true },
    packageId: { type: String, default: 'unknown' },
    time: { type: Date, default: Date.now }
});

// ✅ Yeh tumhara ALAG collection banayega MongoDB mein
const Booking = mongoose.model("Booking", bookingSchema);

/* ===================== BOOKING ROUTE ===================== */
// ✅ Yeh tumhara ALAG counter hai Booking ke liye
app.post("/api/create-booking", async (req, res) => {
    console.log("📝 Booking request received:", req.body);
    try {
        const { fullName, email, packageName, packagePrice, packageId } = req.body;
        
        // Validation
        if (!fullName || !email || !packageName || !packagePrice) {
            return res.status(400).json({ 
                success: false,
                message: "All fields required" 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // ✅ Data ALAG booking collection mein save hoga
        const newBooking = new Booking({
            fullName,
            email,
            packageName,
            packagePrice,
            packageId: packageId || 'unknown'
        });

        await newBooking.save();

        console.log("✅ Booking saved - ID:", newBooking._id);
        res.status(201).json({ 
            success: true,
            message: "Booking confirmed successfully!",
            bookingId: newBooking._id
        });

    } catch (error) {
        console.error("❌ Booking error:", error);
        res.status(500).json({ 
            success: false,
            message: "Server error while saving booking" 
        });
    }
});


/* ===================== CONTACT ===================== */
app.post("/contact", async (req, res) => {
    console.log("📧 Contact request");
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


/* ===================== SUBSCRIBE SCHEMA ===================== */
const subscribeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    time: { type: Date, default: Date.now }
});

const Subscriber = mongoose.model("Subscriber", subscribeSchema);

/* ===================== SUBSCRIBE ROUTE ===================== */
app.post("/api/subscribe", async (req, res) => {
    console.log("📧 Subscribe request:", req.body.email);
    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: "Valid email required" });
        }

        // Check if already subscribed
        const exists = await Subscriber.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email already subscribed" });
        }

        await Subscriber.create({ email });
        console.log("✅ Subscriber added:", email);
        res.json({ message: "Subscribed successfully!" });

    } catch (err) {
        console.error("❌ Subscribe error:", err);
        res.status(500).json({ message: "Server error" });
    }
});



/* ===================== SERVER START ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("🚀 Server started on port " + PORT);
    console.log("✅ Health check: /health");
});