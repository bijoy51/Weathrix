
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

function average(arr) {
  const nums = arr.filter(v => !isNaN(v));
  return nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
}

app.post("/merra2", async (req, res) => {
  try {
    const { lat, lon, startDate, endDate } = req.body;


    const startMD = startDate.slice(5); // MM-DD
    const endMD = endDate.slice(5);     // MM-DD

    const inputYear = parseInt(startDate.slice(0, 4));
    const yearsBack = 5;
    let allData = [];

    // 🔹 Fetch past 5 years
    for (let yr = inputYear - yearsBack; yr < inputYear; yr++) {
      // ensure MM and DD are two digits
      const startParts = startMD.split("-").map(p => p.padStart(2, "0"));
      const endParts = endMD.split("-").map(p => p.padStart(2, "0"));

      const s = `${yr}${startParts[0]}${startParts[1]}`;
      const e = `${yr}${endParts[0]}${endParts[1]}`;

      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS2M,PRECTOTCORR&start=${s}&end=${e}&latitude=${lat}&longitude=${lon}&format=JSON&community=RE`;

      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        console.warn(`NASA API warning for year ${yr}: ${response.status} - ${text}`);
        continue;
      }

      const data = await response.json();
      if (data.properties?.parameter) {
        const params = data.properties.parameter;
        const dates = Object.keys(params.T2M);

        dates.forEach(d => {
          allData.push({
            year: yr,
            date: d,           // YYYYMMDD
            md: d.slice(4, 8), // MMDD
            temp: params.T2M[d],
            humidity: params.RH2M[d],
            wind: params.WS2M[d],
            rain: params.PRECTOTCORR[d]
          });
        });
      }
    }

    // 🔹 Group by MMDD
    const grouped = {};
    allData.forEach(r => {
      if (!grouped[r.md]) grouped[r.md] = [];
      grouped[r.md].push(r);
    });

    // 🔹 Future table (average per MMDD)
    const futureTable = Object.keys(grouped).sort().map(md => {
      const group = grouped[md];
      return {
        date: `${inputYear}-${md.slice(0, 2)}-${md.slice(2, 4)}`, // YYYY-MM-DD
        temp: average(group.map(r => r.temp)),
        humidity: average(group.map(r => r.humidity)),
        wind: average(group.map(r => r.wind)),
        rain: average(group.map(r => r.rain))
      };
    });

    // 🔹 Return past data as-is and future table
    const pastTable = allData;

    res.json({ pastTable, futureTable });

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Backend port 5501 to match frontend
app.listen(5503, () =>
  console.log("Server running on http://localhost:5503")
);
