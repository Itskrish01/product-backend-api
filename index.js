require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/product"); // Assuming you have a product model defined
const { default: Stripe } = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

app.use(
  cors({
    origin: "*", // Replace with the actual frontend URL
  })
);
app.use(express.json());

// Routes go here
app.get("/", (req, res) => {
  res.send({ title: "Products API" });
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post("/products/add", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      category,
      thumbnail,
      variants,
    } = req.body;

    const newProduct = new Product({
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      category,
      thumbnail,
      variants,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Stripe endpoint to create a Checkout Session
app.post("/stripe", async (req, res) => {
  try {
    const { _id } = req.body; // Assuming you send the product ID in the request body

    // Fetch the product details from the database
    const product = await Product.findById(_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Convert the price from USD to INR (using an exchange rate or API)
    const exchangeRate = 73.5; // Example exchange rate (1 USD to INR)
    const priceInINR = product.price * exchangeRate;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr", // Use INR as the currency for Stripe
            product_data: {
              name: product.title,
              images: [product.thumbnail],
            },
            unit_amount: Math.round(priceInINR * 100), // Convert to paisa (smallest currency unit in INR)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://nextjs-ecommerce-app-five.vercel.app//success`,
      cancel_url: `https://nextjs-ecommerce-app-five.vercel.app//canceled`,
    });

    res.status(201).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Listening for requests");
  });
});
