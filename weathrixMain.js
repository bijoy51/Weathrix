function showBox() {
    document.getElementById("resultBox").style.display = 'block'
}
function speakText(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}  
function handleCommand(command) {
    console.log("Command received:", command);
    speakText("It will be very hot, I don't recommend doing it tomorrow");
    showBox();
}
    
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
  
const micBtn = document.getElementById("micBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
 
micBtn.addEventListener("click", () => {
    recognition.start();
});
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized:", transcript);
    searchInput.value = transcript;
};
  
recognition.onerror = (event) => {
    console.error("Error occurred in recognition:", event.error);
};
searchBtn.addEventListener("click", () => {
    const text = searchInput.value.trim();
    if (!text) {
        speakText("Please write something first.");
        return;
    }

    if (!navigator.geolocation) {
        alert("Geolocation not supported in your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log("Got location:", lat, lon);
        
            localStorage.setItem("userLocation", `${lat}, ${lon}`);
            localStorage.setItem("userInput", text);
        
            window.location.href = "weathrixDeshboard.html";
        },
        (err) => {
            console.warn("Location error:", err);
            alert("tmi j location access dao");
        }
    );
});
const slides = document.querySelectorAll(".slide");
const badge = document.querySelector(".season-badge");
const seasons = ["Summer", "Monsoon", "Autumn", "Late Autumn", "Winter", "Spring"];
let index = 0;
    
function showSlide(i) {
    slides.forEach((slide, idx) => {
        slide.classList.toggle("active", idx === i);
    });
    badge.textContent = seasons[i];
}
    
showSlide(index);
setInterval(() => {
    index = (index + 1) % slides.length;
    showSlide(index);
}, 6000);
const apiKey = "eb85f6c8b64f24200ce985073dada23f";
    
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        document.getElementById("manualLocation").style.display = "block";
    }
}
    
function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeather(lat, lon);
}
    
function error(err) {
    console.log(err);
    document.getElementById("manualLocation").style.display = "block";
}
    
async function getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    showWeather(data);
}
    
async function getWeatherByCity() {
    const city = document.getElementById("city").value;
    if (!city) return alert("Please enter a city");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    showWeather(data);
}