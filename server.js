require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") ||
        "https://ehr-system.up.railway.app/"
      : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  res.status(200).send(healthcheck);
});

app.get("/", (req, res) => res.send("EHR API Running"));

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    if (process.env.NODE_ENV === "production") {
      console.error("Database connection failed, exiting application");
      process.exit(1);
    } else {
      console.log("Will retry database connection in 5 seconds...");
      setTimeout(connectDB, 5000);
    }
  }
};

connectDB();

try {
  const routesDir = path.join(__dirname, "routes");
  if (fs.existsSync(routesDir)) {
    fs.readdirSync(routesDir).forEach((file) => {
      if (file.endsWith(".js")) {
        try {
          const route = `/api/${file.replace(".js", "")}`;
          const routeModule = require(`./routes/${file}`);

          if (typeof routeModule === "function" || routeModule.router) {
            app.use(route, routeModule);
            console.log(`Loaded route: ${route}`);
          } else {
            console.warn(`Skipping ${file}: Not a valid Express router`);
          }
        } catch (routeError) {
          console.error(`Error loading route ${file}:`, routeError.message);
        }
      }
    });
  } else {
    console.warn("Routes directory not found");
  }
} catch (err) {
  console.error("Error loading routes:", err.message);
}

app.use((req, res, next) => {
  res.status(404).send({
    status: 404,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    status: statusCode,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

const server = app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  if (process.env.NODE_ENV === "production") {
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);

  if (process.env.NODE_ENV === "production") {
    server.close(() => {
      process.exit(1);
    });
  }
});
