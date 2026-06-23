"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./db/data-source");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
// Import routers
const user_1 = __importDefault(require("./routes/user"));
const banner_1 = __importDefault(require("./routes/banner"));
const address_1 = __importDefault(require("./routes/address"));
const about_page_1 = __importDefault(require("./routes/about-page"));
const cart_1 = __importDefault(require("./routes/cart"));
const category_1 = __importDefault(require("./routes/category"));
const contact_page_1 = __importDefault(require("./routes/contact-page"));
const response_1 = __importDefault(require("./routes/response"));
const offer_1 = __importDefault(require("./routes/offer"));
const product_1 = __importDefault(require("./routes/product"));
const review_1 = __importDefault(require("./routes/review"));
const order_1 = __importDefault(require("./routes/order"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const payment_1 = __importDefault(require("./routes/payment"));
const logs_1 = __importDefault(require("./routes/logs"));
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
// Gzip Compression
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many authentication attempts, please try again after 15 minutes"
});
const reviewLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many review submissions, limit is 5 reviews per hour"
});
const contactLimiter = (0, express_rate_limit_1.default)({
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
    }
    else {
        next();
    }
});
app.use("/contact", (req, res, next) => {
    if (req.method === "POST") {
        contactLimiter(req, res, next);
    }
    else {
        next();
    }
});
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN === "*"
        ? (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true)
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
// Route registration
app.use("/users", user_1.default);
app.use("/banners", banner_1.default);
app.use("/addresses", address_1.default);
app.use("/about-page", about_page_1.default);
app.use("/cart", cart_1.default);
app.use("/categories", category_1.default);
app.use("/contact", contact_page_1.default);
app.use("/responses", response_1.default);
app.use("/offers", offer_1.default);
app.use("/products", product_1.default);
app.use("/reviews", review_1.default);
app.use("/orders", order_1.default);
app.use("/wishlist", wishlist_1.default);
app.use("/dashboard", dashboard_1.default);
app.use("/payment", payment_1.default);
app.use("/logs", logs_1.default);
// Home route (moved above the 404 fallback to fix route order bug)
app.get("/", (req, res) => res.send("hello world"));
// 404 Fallback
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});
// Error handling middleware
app.use(error_middleware_1.errorHandler);
// Database initialization & Server startup
data_source_1.AppDataSource.initialize()
    .then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
    });
})
    .catch((err) => {
    logger_1.default.error("PostgreSQL database connection failed: " + err.message);
});
