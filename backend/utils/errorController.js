import CustomError from "./CustomError.js";

// Express error-handling middleware
export default (err, req, res, next) => {
  err = err || new Error("Unknown error");

  console.error(err);

  if (err instanceof CustomError) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      status: err.status || (statusCode >= 500 ? "error" : "fail"),
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || (statusCode >= 500 ? "error" : "fail");

  return res.status(statusCode).json({
    success: false,
    status,
    message: err.message || "Internal Server Error",
  });
};