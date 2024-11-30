// Existing greeting code
function greet() {
    let time = new Date().getHours();
    if (time >= 5 && time < 12) {
        alert("Good Morning!");
    } else if (time >= 12 && time < 17) {
        alert("Good Afternoon!");
    } else if (time >= 17 && time < 21) {
        alert("Good Evening!");
    } else {
        alert("Good Night!");
    }
}

// Audio controls
const music = document.getElementById('background-music');
const volumeSlider = document.getElementById('volume-slider');

music.volume = parseFloat(volumeSlider.value);

volumeSlider.addEventListener('input', () => {
    if (music.paused) {
        music.play();
    }
    music.volume = volumeSlider.value;
});

// Weather functionality using wttr.in
async function getWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        console.log('Location:', latitude, longitude);

        const response = await fetch(
            `https://wttr.in/${latitude},${longitude}?format=j1`
        );

        const data = await response.json();
        const current = data.current_condition[0];

        const weaIcon = document.querySelector('.wea-icon');
        const temperature = document.querySelector('.temperature');
        const description = document.querySelector('.description');
        const location = document.querySelector('.location');

        const weatherCode = parseInt(current.weatherCode);
        let iconClass = 'fas ';

        if (weatherCode <= 113) {
            iconClass += 'fa-sun';
        } else if (weatherCode <= 116) {
            iconClass += 'fa-cloud-sun';
        } else if (weatherCode <= 122) {
            iconClass += 'fa-cloud';
        } else if (weatherCode <= 182) {
            iconClass += 'fa-cloud-rain';
        } else if (weatherCode <= 227) {
            iconClass += 'fa-snowflake';
        } else if (weatherCode <= 248) {
            iconClass += 'fa-smog';
        } else if (weatherCode <= 260) {
            iconClass += 'fa-smog';
        } else if (weatherCode <= 298) {
            iconClass += 'fa-cloud-rain';
        } else if (weatherCode <= 392) {
            iconClass += 'fa-cloud-showers-heavy';
        } else {
            iconClass += 'fa-snowflake';
        }

        weaIcon.innerHTML = `<i class="${iconClass}"></i>`;
        temperature.textContent = `${current.temp_C}°C`;
        description.textContent = current.weatherDesc[0].value;
        location.textContent = data.nearest_area[0].areaName[0].value;

    } catch (error) {
        console.error('Error fetching weather:', error);
        const weaWidget = document.querySelector('.wea-widget');
        weaWidget.innerHTML = `
            <div class="wea-content">
                <div class="wea-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="wea-info">
                    <span class="temperature">N/A</span>
                    <span class="description">Weather unavailable</span>
                    <span class="location">Please enable location services</span>
                </div>
            </div>`;
    }
}
/*
// Initialize
document.addEventListener('DOMContentLoaded', function() {
    getWeather();
    greet();
});*/

// Refresh weather every 30 minutes
setInterval(getWeather, 1800000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
