import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";

import databaseConnection from "./config/database";
import { failure } from "./utilities/common";

import authRouter from "./routes/AuthRoutes";
import userRouter from "./routes/UserRoutes";
import resourceRouter from "./routes/ResourceRoutes";

const app = express();
dotenv.config();

app.use(cors({ origin: "*", credentials: true }));

app.use(cookieParser()); // Needed to read cookies
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: false })); // Parses data as URL-encoded

// ✅ Handle Invalid JSON Errors
app.use(
  (
    err: SyntaxError & { status?: number; body?: any },
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).send(failure("Invalid JSON format"));
    }
    next();
  }
);

// middleware to serve static files from the "public" directory
app.use("/public", express.static(path.join(__dirname, "..", "public")));

const baseApiUrl_V1 = "/api/v1";

app.use(`${baseApiUrl_V1}/auth`, authRouter);
app.use(`${baseApiUrl_V1}/users`, userRouter);
app.use(`${baseApiUrl_V1}/resources`, resourceRouter);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).send({
    name: "Cikleshare Backend",
    developer: "Abir",
    version: "1.0.0",
    description: "Backend server for Cikleshare Backend",
    status: "success",
  });
});

// ✅ Handle 404 Routes
app.use((req, res) => {
  return res.status(400).send(failure("Route does not exist"));
});

// ✅ Handle Global Errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error", err);

  // Handle Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .send(
          failure(
            `Unexpected field: '${err.field}'. Multiple files for this field are not allowed.`
          )
        );
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send(failure("File size too large"));
    }
    return res.status(400).send(failure(err.message));
  }

  // Handle other errors
  res.status(500).send(failure("Internal Server Error"));
});

const PORT = process.env.PORT || 3031;

databaseConnection(() => {
  const server = app.listen(PORT);

  server.on("listening", () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
      console.error(`❌ Another process is using this port. Stop it first.\n`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });
});
