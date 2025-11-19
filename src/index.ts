import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";

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
      return res.status(400).send({ message: "Invalid JSON format" });
    }
    next();
  }
);

// middleware to serve static files from the "public" directory
app.use("/public", express.static(path.join(__dirname, "..", "public")));

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
  return res.status(400).send({ message: "Route does not exist" });
});

// ✅ Handle Global Errors
app.use((err: SyntaxError, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error", err);
  res.status(500).send({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
