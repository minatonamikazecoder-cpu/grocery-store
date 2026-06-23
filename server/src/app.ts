import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import { AppDataSource } from "./db/data-source";
import { errorHandler } from "./middlewares/error.middleware";
import logger from "./utils/logger";

dotenv.config();

// Import routers
import userRoutes from "./routes/user";
import bannerRoutes from "./routes/banner";
import addressRoutes from "./routes/address";
import aboutPageRoutes from "./routes/about-page";
import cartRoutes from "./routes/cart";
import categoryRoutes from "./routes/category";
import contactPageRoutes from "./routes/contact-page";
import responseRoutes from "./routes/response";
import offerRoutes from "./routes/offer";
import productRoutes from "./routes/product";
import reviewRoutes from "./routes/review";
import orderRoutes from "./routes/order";
import wishlistRoutes from "./routes/wishlist";
import dashboardRoutes from "./routes/dashboard";
import paymentRoutes from "./routes/payment";
import logRoutes from "./routes/logs";

const app = express();

// Security Middleware
app.use(helmet());

// Gzip Compression
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again after 15 minutes"
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many review submissions, limit is 5 reviews per hour"
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many contact submissions, limit is 3 requests per hour"
});

app.use("/users/login", limiter);
app.use("/users/register", limiter);
app.use("/users/send-otp", limiter);
app.use("/users/reset-password", authLimiter);
app.use("/users/update-password", authLimiter);
app.use("/reviews", (req, res, next) => {
  if (req.method === "POST") {
    reviewLimiter(req, res, next);
  } else {
    next();
  }
});
app.use("/contact", (req, res, next) => {
  if (req.method === "POST") {
    contactLimiter(req, res, next);
  } else {
    next();
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN === "*" 
    ? (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true) 
    : process.env.CORS_ORIGIN?.split(","),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})); 

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route registration
app.use("/users", userRoutes);
app.use("/banners", bannerRoutes);
app.use("/addresses", addressRoutes);
app.use("/about-page", aboutPageRoutes);
app.use("/cart", cartRoutes);
app.use("/categories", categoryRoutes);
app.use("/contact", contactPageRoutes);
app.use("/responses", responseRoutes);
app.use("/offers", offerRoutes);
app.use("/products", productRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/payment", paymentRoutes);
app.use("/logs", logRoutes);

// Home route (moved above the 404 fallback to fix route order bug)
app.get("/", (req, res) => res.send("hello world"));

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Database initialization & Server startup
AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    logger.error("PostgreSQL database connection failed: " + err.message);
  });
