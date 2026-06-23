import "reflect-metadata";
import { AppDataSource } from "../src/db/data-source";
import { User } from "../src/models/User";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { Banner } from "../src/models/Banner";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    console.log("Database connected successfully!");

    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);
    const productRepo = AppDataSource.getRepository(Product);
    const bannerRepo = AppDataSource.getRepository(Banner);

    // 1. Seed Banners
    console.log("Seeding Banners...");
    await bannerRepo.clear();
    const banner = bannerRepo.create({
      bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
      viewOrder: 1,
      activeStatus: true,
      type: "slider",
    });
    await bannerRepo.save(banner);
    console.log("Banners seeded.");

    // 2. Seed Users
    console.log("Seeding Admin User...");
    const existingAdmin = await userRepo.findOneBy({ email: "admin@purebite.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123", 10);
      const admin = userRepo.create({
        firstName: "System",
        lastName: "Admin",
        email: "admin@purebite.com",
        mobile: "1234567890",
        password: hashedPassword,
        role: "Admin",
        status: "Active",
        authType: "Email",
      });
      await userRepo.save(admin);
      console.log("Admin user created (admin@purebite.com / Admin123).");
    } else {
      console.log("Admin user already exists.");
    }

    console.log("Seeding Customer User...");
    const existingCustomer = await userRepo.findOneBy({ email: "user@purebite.com" });
    if (!existingCustomer) {
      const hashedPassword = await bcrypt.hash("User123", 10);
      const customer = userRepo.create({
        firstName: "John",
        lastName: "Doe",
        email: "user@purebite.com",
        mobile: "0987654321",
        password: hashedPassword,
        role: "User",
        status: "Active",
        authType: "Email",
      });
      await userRepo.save(customer);
      console.log("Customer user created (user@purebite.com / User123).");
    } else {
      console.log("Customer user already exists.");
    }

    // 3. Seed Categories
    console.log("Seeding Categories...");
    await categoryRepo.query("TRUNCATE TABLE category CASCADE");
    const categories = [
      categoryRepo.create({ name: "Fruits & Vegetables", color: "#e8f5e9", image: "https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=400", isDeleted: false }),
      categoryRepo.create({ name: "Dairy Products", color: "#e3f2fd", image: "https://images.unsplash.com/photo-1563636619-e9107d1c1fca?w=400", isDeleted: false }),
      categoryRepo.create({ name: "Bakery & Bread", color: "#fff8e1", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", isDeleted: false }),
      categoryRepo.create({ name: "Beverages", color: "#f3e5f5", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400", isDeleted: false }),
    ];
    const savedCategories = await categoryRepo.save(categories);
    console.log(`${savedCategories.length} categories seeded.`);

    // 4. Seed Products
    console.log("Seeding Products...");
    const products = [
      productRepo.create({
        productName: "Organic Apples",
        description: "Crispy, fresh, and sweet organic red apples loaded with vitamins.",
        salePrice: 120.00,
        costPrice: 80.00,
        discount: 10,
        stock: 50,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600",
        categoryId: savedCategories[0].id,
      }),
      productRepo.create({
        productName: "Fresh Spinach",
        description: "Nutritious farm-fresh organic green spinach leaves.",
        salePrice: 30.00,
        costPrice: 20.00,
        discount: 5,
        stock: 100,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600",
        categoryId: savedCategories[0].id,
      }),
      productRepo.create({
        productName: "Organic Bananas",
        description: "Sweet, nutrient-dense organic yellow bananas sourced from certified farms.",
        salePrice: 60.00,
        costPrice: 40.00,
        discount: 5,
        stock: 120,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600",
        categoryId: savedCategories[0].id,
      }),
      productRepo.create({
        productName: "Heirloom Tomatoes",
        description: "Juicy, colorful organic heirloom tomatoes perfect for salads and cooking.",
        salePrice: 80.00,
        costPrice: 50.00,
        discount: 10,
        stock: 60,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600",
        categoryId: savedCategories[0].id,
      }),
      productRepo.create({
        productName: "Whole Milk",
        description: "1 Liter of premium farm whole milk pasteurized and rich in calcium.",
        salePrice: 50.00,
        costPrice: 40.00,
        discount: 0,
        stock: 40,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1563636619-e9107d1c1fca?w=600",
        categoryId: savedCategories[1].id,
      }),
      productRepo.create({
        productName: "Greek Yogurt",
        description: "Rich, creamy, and high-protein organic Greek yogurt with active cultures.",
        salePrice: 70.00,
        costPrice: 50.00,
        discount: 12,
        stock: 30,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
        categoryId: savedCategories[1].id,
      }),
      productRepo.create({
        productName: "Organic Butter",
        description: "Creamy, salted butter made from the milk of grass-fed cows.",
        salePrice: 150.00,
        costPrice: 100.00,
        discount: 0,
        stock: 45,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600",
        categoryId: savedCategories[1].id,
      }),
      productRepo.create({
        productName: "Artisan Sourdough",
        description: "Freshly baked artisan sourdough bread with a crispy crust and soft interior.",
        salePrice: 90.00,
        costPrice: 60.00,
        discount: 15,
        stock: 20,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600",
        categoryId: savedCategories[2].id,
      }),
      productRepo.create({
        productName: "Chocolate Croissants",
        description: "Flaky, buttery croissants filled with premium dark chocolate.",
        salePrice: 110.00,
        costPrice: 70.00,
        discount: 8,
        stock: 25,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
        categoryId: savedCategories[2].id,
      }),
      productRepo.create({
        productName: "Organic Green Tea",
        description: "Antioxidant-rich organic green tea leaves for a healthy, refreshing brew.",
        salePrice: 180.00,
        costPrice: 120.00,
        discount: 20,
        stock: 80,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600",
        categoryId: savedCategories[3].id,
      }),
      productRepo.create({
        productName: "Fresh Orange Juice",
        description: "100% pure squeezed orange juice with pulp, no added sugar.",
        salePrice: 95.00,
        costPrice: 60.00,
        discount: 10,
        stock: 40,
        isActive: true,
        productImage: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600",
        categoryId: savedCategories[3].id,
      }),
    ];
    await productRepo.save(products);
    console.log("Products seeded successfully.");

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
