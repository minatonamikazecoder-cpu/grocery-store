import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

// Define inline schemas to avoid dependency issues with existing models if they use commonjs
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true }
});

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: String,
  discount: { type: Number, default: 0 },
  costPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  stock: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  productImage: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI + "/purebite";
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // 1. Seed Categories
    const categories = [
      { name: 'Fruits & Vegetables', description: 'Fresh farm produce' },
      { name: 'Dairy Products', description: 'Milk, cheese and more' },
      { name: 'Bakery & Bread', description: 'Freshly baked items' },
      { name: 'Beverages', description: 'Juices, sodas and coffee' }
    ];

    const seededCategories = [];
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        const newCat = await Category.create(cat);
        seededCategories.push(newCat);
        console.log(`Created category: ${cat.name}`);
      } else {
        seededCategories.push(existing);
        console.log(`Category exists: ${cat.name}`);
      }
    }

    // 2. Seed Products
    const products = [
      {
        productName: 'Organic Apples',
        description: 'Crispy and sweet organic red apples.',
        discount: 10,
        costPrice: 80,
        salePrice: 120,
        stock: 50,
        categoryId: seededCategories[0]._id,
        productImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
      },
      {
        productName: 'Fresh Spinach',
        description: 'Nutritious green spinach leaves.',
        discount: 5,
        costPrice: 20,
        salePrice: 30,
        stock: 100,
        categoryId: seededCategories[0]._id,
        productImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb'
      },
      {
        productName: 'Whole Milk',
        description: '1 Liter of fresh farm milk.',
        discount: 0,
        costPrice: 40,
        salePrice: 50,
        stock: 40,
        categoryId: seededCategories[1]._id,
        productImage: 'https://images.unsplash.com/photo-1563636619-e9107d1c1fca'
      },
      {
        productName: 'Artisan Sourdough',
        description: 'Handmade sourdough bread.',
        discount: 15,
        costPrice: 60,
        salePrice: 90,
        stock: 20,
        categoryId: seededCategories[2]._id,
        productImage: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb'
      }
    ];

    for (const prod of products) {
      const existing = await Product.findOne({ productName: prod.productName });
      if (!existing) {
        await Product.create(prod);
        console.log(`Created product: ${prod.productName}`);
      } else {
        console.log(`Product exists: ${prod.productName}`);
      }
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
