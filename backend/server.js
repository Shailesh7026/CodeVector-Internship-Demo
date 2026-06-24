import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import CustomError from "./utils/CustomError.js";
import errorController from "./utils/errorController.js";
import productRoutes from "./routers/productRoutes.js"; 
import connectDB from "./config/db.js";


const app = express();

// start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors({
  origin: [
    process.env.FRONTEND_BASE_URL,
    process.env.FRONTEND_BASE_URL_PROD
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// APP ROUTES
app.get("/", (req, res) => {
  res.send("App is running...");
});

app.use("/api/v1/products", productRoutes);

// Catch all unmatched routes and forward to error handler
app.use((req, res, next) => {
  const err = new CustomError(`Can't find ${req.originalUrl} on this server`, 404);
  next(err);
});

app.use(errorController);

// In case of unhandled promise rejections: shut down the server gracefully
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err && err.name, err && err.message);
  console.error("Shutting down server due to unhandled promise rejection...");
  server.close(() => {
    process.exit(1);
  });
});
