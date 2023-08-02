const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VariantSchema = new Schema({
  variant_name: {
    type: String,
    required: true,
  },
  variant_color: {
    type: String,
    required: true,
  },
  variant_images: {
    type: [String],
    required: true,
  },
});

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  variants: [VariantSchema],
});

module.exports = mongoose.model("Product", ProductSchema);
