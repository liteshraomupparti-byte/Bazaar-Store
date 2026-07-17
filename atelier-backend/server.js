// Bazaar backend — creates Razorpay orders and verifies payments.
// The Razorpay SECRET key lives only here, never in the frontend.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
app.use(cors());          // for real deployment, restrict this to your site's domain
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Bazaar backend is running" });
});

// 1. Create an order before opening the Razorpay checkout modal
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees, sent from the frontend
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay wants paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create order" });
  }
});

// 2. Verify the payment signature Razorpay sends back after checkout
app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const valid = expectedSignature === razorpay_signature;

  // In a real store, only mark the order as "paid" in your database if valid === true.
  res.json({ valid });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Bazaar backend listening on http://localhost:${PORT}`);
});
