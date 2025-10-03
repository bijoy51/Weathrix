// // server.js
// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import path from "path";
// import { fileURLToPath } from "url";
// import 'dotenv/config';
// import { spawn } from "child_process";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(bodyParser.json());

// const apiKey = process.env.API_KEY;

// // Serve HTML
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html")); // HTML সরাসরি project folder থেকে
// });

// // Serve JS files
// app.get("/app.js", (req, res) => {
//   res.sendFile(path.join(__dirname, "app.js"));
// });

// // Serve CSS files
// app.get("/style.css", (req, res) => {
//   res.sendFile(path.join(__dirname, "style.css"));
// });

// // Weather API endpoint
// app.get("/weather", async (req, res) => {
//   try {
//     const city = req.query.city;
//     if (!city) return res.status(400).json({ error: "City is required" });

//     const fetch = (await import("node-fetch")).default;
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

//     const data = await fetch(url).then(r => r.json());
//     if (data.cod !== 200) return res.status(data.cod).json({ error: data.message });

//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // Check-risk endpoint (Python integration)
// app.post("/check-risk", (req, res) => {
//   const { location, startDate, endDate } = req.body;
//   const py = spawn("python3", ["merra_processor.py", location, startDate, endDate]);

//   let out = "", err = "";
//   py.stdout.on("data", data => { out += data.toString(); });
//   py.stderr.on("data", data => { err += data.toString(); });

//   py.on("close", code => {
//     if (code !== 0) {
//       console.error("Python error:", err);
//       return res.status(500).json({ error: err });
//     }
//     try {
//       const result = JSON.parse(out);
//       res.json(result);
//     } catch (e) {
//       res.status(500).json({ error: "Invalid JSON from Python: " + e.message });
//     }
//   });
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
