require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product"); // Assuming you have a product model defined

const app = express();
const PORT = process.env.PORT || 3000;

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

// Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Listening for requests");
  });
});
