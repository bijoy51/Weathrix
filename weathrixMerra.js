document.addEventListener("DOMContentLoaded", () => {
  const btnRun = document.getElementById("btnRun");
  const btnGeo = document.getElementById("btnGeo");
  const inpLocation = document.getElementById("inpLocation");
  const inpStartDate = document.getElementById("inpStartDate");
  const inpEndDate = document.getElementById("inpEndDate");
  const container = document.getElementById("dataTable");

  // ---------------------- Utility functions ----------------------
  
  function createTable(title, rows) {
    if (!Array.isArray(rows)) {
        rows = [];
    }
    if (!Array.isArray(rows) || rows.length === 0) {
        const div = document.createElement("div");
        div.className = "card pad stack";
        div.innerHTML = `<h3>${title}</h3><p>No data available</p>`;
        return div;
    }
    const div = document.createElement("div");
    div.className = "card pad stack";

    const h3 = document.createElement("h3");
    h3.textContent = title;
    div.appendChild(h3);

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const header = document.createElement("tr");
    ["Date", "Temp (°C)", "Wind (km/h)", "Rain (mm)", "Humidity (%)"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      header.appendChild(th);
    });
    table.appendChild(header);

    rows.forEach(r => {
      const tr = document.createElement("tr");
      [r.date, r.temp, r.wind, r.rain, r.humidity].forEach(val => {
        const td = document.createElement("td");
        td.textContent = val;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    div.appendChild(table);
    return div;
  }

  function average(arr) {
    const nums = arr.filter(v => !isNaN(v));
    return nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function randJitter() {
    return (Math.random() - 0.5) * 2;
  }

  // ---------------------- Run button ----------------------
  btnRun.addEventListener("click", async () => {
    const location = inpLocation.value.trim();
    const startDate = inpStartDate.value;
    const endDate = inpEndDate.value;

    if (!location || !startDate || !endDate) {
      alert("Please enter Location, Start date, End date.");
      return;
    }

    container.innerHTML = "<p>Loading NASA MERRA-2 data...</p>";

    try {
      // 🔹 Geocode with OpenStreetMap
      const locRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const locData = await locRes.json();
      if (!locData.length) throw new Error("Location not found.");
      const lat = parseFloat(locData[0].lat);
      const lon = parseFloat(locData[0].lon);

      // 🔹 Request backend proxy
      const res = await fetch("http://localhost:5501/merra2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, startDate, endDate })
      });

      if (!res.ok) throw new Error("Failed to get data from server");

      const rawData = await res.json();
      console.log("NASA rawData:", rawData);
      
      if (!rawData.pastTable) {
        throw new Error("Invalid data format from server");
      }

      // 🔹 Past data


      const pastRows = rawData.pastTable.map(row => ({
        date: `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6, 8)}`,
        temp: row.temp?.toFixed(1) || "-",
        wind: row.wind ? (row.wind * 3.6).toFixed(1) : "-",
        rain: row.rain?.toFixed(1) || "-",
        humidity: row.humidity?.toFixed(0) || "-"
      }));

      // // 🔹 Calculate averages
      // const avgTemp = average(pastRows.map(r => parseFloat(r.temp) || 0));
      // const avgWind = average(pastRows.map(r => parseFloat(r.wind) || 0));
      // const avgRain = average(pastRows.map(r => parseFloat(r.rain) || 0));
      // const avgHum = average(pastRows.map(r => parseFloat(r.humidity) || 0));

      // // 🔹 Generate simple "future prediction"
      // const futureRows = [];
      // for (let i = 1; i <= 5; i++) {
      //   const futureDate = addDays(new Date(endDate), i);
      //   futureRows.push({
      //     date: futureDate.toISOString().split("T")[0],
      //     temp: (avgTemp + randJitter()).toFixed(1),
      //     wind: (avgWind + randJitter()).toFixed(1),
      //     rain: (avgRain + randJitter()).toFixed(1),
      //     humidity: (avgHum + randJitter()).toFixed(0)
      //   });
      // }

      // // 🔹 Render results
      // container.innerHTML = "";
      // container.appendChild(createTable("Past Data (MERRA-2)", pastRows));
      // container.appendChild(createTable("Future Prediction (Estimate)", futureRows));

      // 🔹 Future data

      const futureRows = rawData.futureTable.map(row => ({
        date: row.date,
        temp: row.temp?.toFixed(1) || "-",
        wind: row.wind ? (row.wind * 3.6).toFixed(1) : "-",
        rain: row.rain?.toFixed(1) || "-",
        humidity: row.humidity?.toFixed(0) || "-"
      }));



      container.innerHTML = "";
      container.appendChild(createTable("Past Data (MERRA-2)", pastRows));
      container.appendChild(createTable("Future Prediction (Estimate)", futureRows));

    } catch (err) {
      console.error(err);
      container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
  });

  // ---------------------- Geo location button ----------------------
  btnGeo.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        inpLocation.value = `${pos.coords.latitude},${pos.coords.longitude}`;
      },
      () => alert("Unable to get location. Allow access."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
});


