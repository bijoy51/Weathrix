website link: https://chimerical-llama-8ac53c.netlify.app/

url :https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS2M,PRECTOTCORR&start=${s}&end=${e}&latitude=${lat}&longitude=${lon}&format=JSON&community=RE

NASA POWER (Prediction Of Worldwide Energy Resources) API  endpoint.
Main source: MERRA-2 reanalysis dataset (1981–Present).

For a better explanation of our code, please read the README.md file.

Note:
OPENWEATHER_KEY:eb85f6c8b64f24200ce985073dada23f

# 🌤️ Weathrix — Weather Risk Dashboard

**Weathrix** is a science-first, map-centric weather risk dashboard powered by **NASA POWER (MERRA-2)**, **OpenStreetMap**, and **Chart.js**.  
It allows users to analyze **past weather data** and get **future estimates** for planning activities such as **hiking, fishing, or travel**.

---

## ✨ Features
- 📍 Search weather by **city/place** (OpenStreetMap geocoding)  
- 🗺️ Interactive map using **Leaflet.js**  
- 📊 Charts (temperature & rainfall forecast) with **Chart.js**  
- 🎤 Voice input support for location/activity  
- 🌡️ Weather KPIs:
  - Temperature (°C)
  - Humidity (%)
  - Wind speed (km/h)
  - Rainfall (mm/day)
- 🧮 Uses **NASA MERRA-2 (POWER API)** for past 5 years of data → averages future conditions  
- 📅 Date range selection for activity planning  
- 🎧 Text-to-speech weather advice  

---

## 🗂️ Project Structure
Weathrix/
│── frontend/
│ ├── weathrixMain.html # Landing page (slideshow + search bar)
│ ├── weathrixMain.css # Landing page styles
│ ├── weathrixMain.js # Landing page logic (speech + search)
│ ├── weathrixDeshboard.html # Dashboard UI (map + charts + tables)
│ ├── weathrixDeshboard.css # Dashboard styles
│ ├── weathrixDeshboard.js # Dashboard logic (fetch NASA data, render tables)
│
│── backend/
│ └── weathrixMerra.js # Node.js Express server (NASA POWER proxy)
│
└── README.md

Frontend

Simply open frontend/weathrixMain.html in your browser.
For a smoother dev experience, you can use Live Server extension in VS Code.

The dashboard (weathrixDeshboard.html) loads:

Leaflet.js (map)

Chart.js (charts)

OpenStreetMap Geocoding

NASA POWER backend API (/merra2)

Usage

Open Weathrix landing page (weathrixMain.html).

Enter your plan/activity or use microphone 🎤.

Switch to Dashboard for detailed analysis.

Enter a location and date range, then click Check Risk.

Dashboard will show:

Past weather data (MERRA-2 historical values)

Future prediction (based on 5-year averages)

Charts & KPIs

🚀 Tech Stack

Frontend: HTML, CSS, JavaScript

UI: Leaflet.js (map), Chart.js (charts)

Backend: Node.js + Express.js

Data Source: NASA POWER (MERRA-2)

Geocoding: OpenStreetMap Nominatim

📌 Notes

Requires internet access (NASA POWER API, OSM Geocoding).

Backend must be running (node weathrixMerra.js) before frontend requests.

Ports must match (default: 5503).

📜 License

MIT License © 2025 — Weathrix Project
