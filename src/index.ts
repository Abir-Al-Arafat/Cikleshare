import express, { Request, Response } from "express";

const app = express();

app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: false })); // Parses data as URL-encoded

app.get("/", (req: Request, res: Response) => {
  return res.status(200).send({
    name: "Cikleshare Backend",
    developer: "Abir",
    version: "1.0.0",
    description: "Backend server for Cikleshare Backend",
    status: "success",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
