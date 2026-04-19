import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname)); 


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


app.post("/create-checkout-session", async (req, res) => {
  try {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

  
    const lineItems = items.map((item) => {
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }

     
      const imageUrl =
        item.image && (item.image.startsWith("http://") || item.image.startsWith("https://"))
          ? [item.image]
          : [];

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Untitled Item",
            images: imageUrl,
          },
          unit_amount: Math.round(price * 100), 
        },
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      };
    });

  
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/cart.html",
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ STRIPE ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
