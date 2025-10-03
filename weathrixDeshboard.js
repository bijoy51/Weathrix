document.addEventListener("DOMContentLoaded", () => {
    const btnRun = document.getElementById("btnRun");
    const btnGeo = document.getElementById("btnGeo");
    const inpLocation = document.getElementById("inpLocation");
    const inpDate = document.getElementById("inpDate");
    const err = document.getElementById("err");
    const place = document.getElementById("place");
    const dateView = document.getElementById("dateView");
    const kpiTemp = document.getElementById("kpiTemp");
    const kpiApp = document.getElementById("kpiApp");
    const bHeat = document.getElementById("bHeat");
    const bCold = document.getElementById("bCold");
    const bWind = document.getElementById("bWind");
    const bRain = document.getElementById("bRain");
    const bComfort = document.getElementById("bComfort");
    const weatherCard = document.getElementById("weatherCard");
    const kpiWind = document.getElementById("kpiWind");
    const OPENWEATHER_KEY = "Please check in README.md";
    const loc = localStorage.getItem("userLocation");
    const userText = localStorage.getItem("userInput");
    const adviceText = document.getElementById("adviceText");
    const speakBtn = document.getElementById("speakBtn");  
    const userInput = localStorage.getItem("userInput") || "Have a nice day!";
    const inpVoice = document.getElementById("inpVoice");
    const btnMic = document.getElementById("btnMic");


    if (loc) {
        inpLocation.value = loc;
        run();
    } else if (userText) {
        inpLocation.value = userText;
        run();
    }

    // ----------------------
    // Function to change background
    // ----------------------
  
    function updateWeatherTheme(temp, rain, condition,cloudPercent = null) {
        weatherCard.className = "card pad";
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 6) {
            weatherCard.classList.add("night");
            place.style.color = "white";
            place.style.fontWeight = "bold";
            kpiTemp.style.color = "white";
            kpiTemp.style.fontWeight = "bold";
        }
        else if (condition.toLowerCase().includes("snow") || temp < 10) {
            weatherCard.classList.add("cold");
        }  
        else if (condition.toLowerCase().includes("storm")){
            weatherCard.classList.add("stormy");
        } 
        else if (condition.toLowerCase().includes("thunder")){
            weatherCard.classList.add("thunder");
        }
        else if (rain > 10) {
            weatherCard.classList.add("heavyRain");   
        } 
        else if (rain > 2) {
            weatherCard.classList.add("rainy");     
        } 
        else if (rain > 0) {
            weatherCard.classList.add("lightRain");   
        } 
        else if (
            condition.toLowerCase().includes("cloud") || (cloudPercent !== null && cloudPercent >= 60)
        ) {
            weatherCard.classList.add("cloudy");
        } 
        else if (temp> 26 && temp < 30 && rain < 5){
            weatherCard.classList.add("sunnyCloud");
        } 
        else if (temp > 20){
            weatherCard.classList.add("sunny");
        } 
    }

    // ----------------------
    // Voice Input
    // ----------------------
  
    btnMic.addEventListener("click", () => {
        if (!("webkitSpeechRecognition" in window)) return alert("Your browser doesn't support Speech Recognition.");
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.start();
        recognition.onresult = (e) => { inpVoice.value = e.results[0][0].transcript; };
    });

    // ----------------------
    // Initialize Map
    // ----------------------
  
    let map = L.map("map").setView([23.8103, 90.4125], 6);
  
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 20
    }).addTo(map);  
    let marker = L.marker([23.8103, 90.4125]).addTo(map);

    // ----------------------
    // Fetch Past 5 Days Weather
    // ----------------------
  
    async function getForecast5DaysWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();
        
    
        let temps = [], rains = [], labels = [], apparentTemps = [];
        let dayMap = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dayMap[date]) {
                dayMap[date] = { temps: [], rains: [], hums: [] };
            }
            dayMap[date].temps.push(item.main.temp);
            dayMap[date].rains.push(item.rain ? item.rain["3h"] || 0 : 0);
            dayMap[date].hums.push(item.main.humidity); 
        });
    
        Object.keys(dayMap).slice(0,5).forEach(date => {
            const tArr = dayMap[date].temps;
            const rArr = dayMap[date].rains;
            const hArr = dayMap[date].hums;
        
            const avgTemp = tArr.reduce((a,b)=>a+b,0)/tArr.length;
            const sumRain = rArr.reduce((a,b)=>a+b,0);
            const avgHum = hArr.reduce((a,b)=>a+b,0)/hArr.length;
            const apparentTemp = avgTemp + (0.33 * avgHum/100 * 40) - 4;
        
            temps.push(avgTemp.toFixed(1));
            rains.push(sumRain.toFixed(1));
            apparentTemps.push(apparentTemp.toFixed(1));
            labels.push(date);
        });  
        return { temps, rains, labels, apparentTemps };
    }

    // ----------------------
    // Geocoding
    // ----------------------
  
    async function geocode(query) {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!data.length) throw new Error("Location not found.");
        return { name: data[0].display_name, lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  
    // ----------------------
    // Get Current Weather
    // ----------------------
  
    async function getWeather(lat, lon) {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        return data;
    }

    // ----------------------
    // Update UI
    // ----------------------
  
    function updateUI(locationName, date, weather) {
        place.textContent = `📍 ${locationName}`;
        dateView.textContent = date;
    
        const t2m = weather.main.temp;
        const wind = weather.wind.speed;
        const rain = weather.rain ? weather.rain["1h"] || 0 : 0;
        const rh = weather.main.humidity;
        const apparentTemp = t2m + (0.33 * rh / 100 * 40) - 4;
    
        kpiTemp.textContent = `${t2m.toFixed(1)}°C`;
        kpiApp.textContent = `${apparentTemp.toFixed(1)}°C`;
        bHeat.textContent = t2m > 35 ? "Very Hot" : "Medium";
        bCold.textContent = t2m < 10 ? "Very Cold" : "Medium";
        kpiWind.textContent = `${(wind * 3.6).toFixed(1)} km/h`;
        bWind.textContent = wind > 10 ? "Very Windy" : "Low";
        bRain.textContent = rain > 10 ? "Very Wet" : "Dry";
        bComfort.textContent = t2m > 18 && t2m < 30 ? "Comfortable" : "Very Uncomfortable";
        updateWeatherTheme(t2m, rain, weather.weather[0].main, weather.clouds?.all);
    }
  
    function updateMap(lat, lon) {
        map.setView([lat, lon], 8);
        marker.setLatLng([lat, lon]);
    }
    
    let tempChart, rainChart;
    function updateCharts(tempData, rainData, labels,apparentData) {
        if (tempChart) tempChart.destroy();
        if (rainChart) rainChart.destroy();
    
        tempChart = new Chart(document.getElementById("lineChart"), {
            type: "line",
            data: {
                labels: labels, 
                datasets: [
                    { label: "Temp (°C)", data: tempData, borderColor: "red", fill: false },
                    { label: "Apparent (°C)", data: apparentData, borderColor: "orange", fill: false } 
                ]}
            });
    
            rainChart = new Chart(document.getElementById("barChart"), {
                type: "bar",
                data: { labels, datasets: [
                    { label: "Rainfall (mm)", data: rainData, backgroundColor: "blue" }
                ]}
            });
        }
        async function safeJson(res) {
            const text = await res.text();
            if (!text) return {};  
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("Invalid JSON:", text);
                throw new Error("Invalid JSON response from server");
            }
        }

    

        // ----------------------
        // Run
        // ----------------------
        
        function renderMerraTables(pastTable, futureTable) {
            const container = document.getElementById("dataTable");
            container.innerHTML = "";
            container.appendChild(createTable("Past Data (MERRA-2)", pastTable.map(r => ({
                date: `${r.date.slice(0,4)}-${r.date.slice(4,6)}-${r.date.slice(6,8)}`,
                temp: r.temp?.toFixed(1) || "-",
                wind: r.wind ? (r.wind * 3.6).toFixed(1) : "-",
                rain: r.rain?.toFixed(1) || "-",
                humidity: r.humidity?.toFixed(0) || "-"
            }))));
            container.appendChild(createTable("Future Prediction (Estimate)", futureTable.map(r => ({
                date: r.date,
                temp: r.temp?.toFixed(1) || "-",
                wind: r.wind ? (r.wind * 3.6).toFixed(1) : "-",
                rain: r.rain?.toFixed(1) || "-",
                humidity: r.humidity?.toFixed(0) || "-"
            }))));
        }
        async function run() {
            err.style.display = "none";
            try {
                const locationQuery = inpLocation.value.trim();
                const date = inpDate.value || new Date().toISOString().split("T")[0];
                if (!locationQuery) throw new Error("অনুগ্রহ করে একটি location লিখুন।");
        
                const loc = await geocode(locationQuery);
                const weather = await getWeather(loc.lat, loc.lon);
        
                updateUI(loc.name, date, weather);
                updateMap(loc.lat, loc.lon);
        
                const { temps, rains, labels, apparentTemps } = await getForecast5DaysWeather(loc.lat, loc.lon);
                updateCharts(temps, rains, labels, apparentTemps);
        
                const temp = weather.main.temp;
                const wind = weather.wind.speed;
                const rainVal = weather.rain ? weather.rain["1h"] || 0 : 0;
        
                generateAdvice(userInput, temp, wind, rainVal);
        
                // ----------------------
                // MERRA-2 Data Fetch
                // ----------------------
        
                const startDateInput = document.getElementById("inpStartDate").value;
                const endDateInput = document.getElementById("inpEndDate").value;
        
                function convertToYYYYMMDD(dateStr) {
                    if (dateStr.includes("/")) {
                        const [month, day, year] = dateStr.split("/");
                        return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
                    }
                    return dateStr; 
                }
        
                const startDate = convertToYYYYMMDD(startDateInput);
                const endDate = convertToYYYYMMDD(endDateInput);
        
                const res = await fetch("http://localhost:5503/merra2", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lat: loc.lat, lon: loc.lon, startDate, endDate })
                });
        
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server Error: ${res.status} - ${text}`);
                }
        
                const result = await safeJson(res);
                renderMerraTables(result.pastTable, result.futureTable);
    
            } catch (e) {
                err.textContent = e.message;
                err.style.display = "block";
                console.error(e);
   
            }
        }
      

        function createTable(title, rows = []) {
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
    
            if (!Array.isArray(rows) || !rows.length) {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                td.colSpan = 5;
                td.textContent = "No data available";
                tr.appendChild(td);
                table.appendChild(tr);
            } else {
                rows.forEach(r => {
                    const tr = document.createElement("tr");
                    [r.date, r.temp, r.wind, r.rain, r.humidity].forEach(val => {
                        const td = document.createElement("td");
                        td.textContent = val;
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                });
            }
    
            div.appendChild(table);
            return div;
        }


        // ----------------------
        // Geo Location Button
        // ----------------------
        
        btnGeo.addEventListener("click", () => {
            if (!navigator.geolocation) return alert("Geolocation not supported");
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    inpLocation.value = `${lat},${lon}`;
                },
                (err) => { alert("Unable to get location. Allow access."); },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
               
        btnRun.addEventListener("click", run);

        // ----------------------
        // AI ADVICE GENERATOR (using OpenAI)
        // ----------------------
  
        async function generateAdvice(text,temp, wind, rain) {
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer Please check in README.md"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are a helpful consultant." },
                            { role: "user", content: `
                                Weather right now: 
                                - Temperature: ${temp}°C
                                - Wind speed: ${wind} m/s
                                - Rain: ${rain} mm
                                User's text: "${text}". Can you analyze the rain, temperature, and wind, and tell me if I can do this activity? Based on the weather, what would be good to do?
                                Advise like human aroud 20 word.` }
                            ],
                            max_tokens: 150,
                            temperature: 0.7
                        })
                    });
      
                    const data = await response.json();
                    if (data.error) {
        
                        adviceText.textContent = "Error: " + data.error.message;
                    } else {
                        adviceText.textContent = data.choices[0].message.content.trim();
                    }
                } catch (err) {
                    adviceText.textContent = "Error generating advice: " + err.message;
                }
            }

            // Call AI advice on page load
  
            generateAdvice(userInput);
  
            // Voice synthesis button
  
            speakBtn.addEventListener("click", () => {
                const utter = new SpeechSynthesisUtterance(adviceText.textContent);
                window.speechSynthesis.speak(utter);
            });
        });
