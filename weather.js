const API_KEY = '81f51fa1e762e8348cfbd4dfc8389f49';
const DEFAULT_CITY = 'Hanoi';

const ICON_MAP = {
    '01d': 'icons/01d.png', '01n': 'icons/01d.png',
    '02d': 'icons/01d.png', '02n': 'icons/01d.png',
    '03d': 'icons/04d.png', '03n': 'icons/04d.png',
    '04d': 'icons/04d.png', '04n': 'icons/04d.png',
    '09d': 'icons/09d.png', '09n': 'icons/09d.png',
    '10d': 'icons/10d_4x.png','10n': 'icons/10d_4x.png',
    '11d': 'icons/09d.png', '11n': 'icons/09d.png',
    '13d': 'icons/04d.png', '13n': 'icons/04d.png',
    '50d': 'icons/04d.png', '50n': 'icons/04d.png',
};

function getLocalIcon(iconCode) {
    return ICON_MAP[iconCode] || `https://openweathermap.org/img/wn/${iconCode}.png`;
}

function translateDesc(desc) {
    const map = {
        'clear sky': 'Trời quang đãng',
        'few clouds': 'Ít mây',
        'scattered clouds': 'Mây rải rác',
        'broken clouds': 'Nhiều mây',
        'overcast clouds': 'Trời âm u',
        'shower rain': 'Mưa rào',
        'rain': 'Có mưa',
        'light rain': 'Mưa nhẹ',
        'moderate rain': 'Mưa vừa',
        'heavy intensity rain': 'Mưa lớn',
        'thunderstorm': 'Giông bão',
        'snow': 'Tuyết rơi',
        'mist': 'Sương mù',
        'fog': 'Sương dày',
        'drizzle': 'Mưa phùn',
        'light intensity drizzle': 'Mưa phùn nhẹ',
    };
    return map[desc.toLowerCase()] || desc.charAt(0).toUpperCase() + desc.slice(1);
}

function formatVietnameseDate(date) {
    const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
    const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                    'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
    const d = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = months[date.getMonth()];
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2,'0');
    const min = String(date.getMinutes()).padStart(2,'0');
    return `${d}, ${dd} ${mm}, ${yyyy} | ${hh}:${min}`;
}

function formatHeaderDate(date) {
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatHeaderTime(date) {
    const hh = String(date.getHours()).padStart(2,'0');
    const min = String(date.getMinutes()).padStart(2,'0');
    return `${hh}:${min}`;
}

function formatForecastDate(date) {
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth()+1).padStart(2,'0');
    return `${dd}/${mm}`;
}

function startClock() {
    function tick() {
        const now = new Date();
        document.getElementById('header-date').textContent = formatHeaderDate(now);
        document.getElementById('header-time').textContent = formatHeaderTime(now);
        document.getElementById('current-date-time').textContent = formatVietnameseDate(now);
    }
    tick();
    setInterval(tick, 1000);
}

async function fetchCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể lấy dữ liệu thời tiết');
    return res.json();
}

async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Không thể lấy dữ liệu dự báo');
    return res.json();
}

function updateCurrentWeather(data) {
    const iconCode = data.weather[0].icon;
    const desc = translateDesc(data.weather[0].description);
    const temp = Math.round(data.main.temp);
    const wind = Math.round(data.wind.speed * 3.6); // m/s -> km/h
    const humidity = data.main.humidity;
    const cityName = data.name;
    const country = data.sys.country;

    document.getElementById('current-location-title').textContent = `${cityName}, Việt Nam`;
    document.getElementById('header-location').textContent = `${cityName}, ${country}`;
    document.getElementById('weather-icon').src = getLocalIcon(iconCode);
    document.getElementById('weather-icon').alt = desc;
    document.getElementById('current-temp').textContent = `${temp}°C`;
    document.getElementById('weather-desc').textContent = desc;
    document.getElementById('wind-speed').textContent = `${wind} km/h`;
    document.getElementById('humidity').textContent = `${humidity}%`;
}

function updateForecast(data) {
    const today = new Date().toLocaleDateString('en-CA');
    const dailyMap = {};

    for (const item of data.list) {
        const dt = new Date(item.dt * 1000);
        const dateKey = dt.toLocaleDateString('en-CA');
        const hour = dt.getHours();

        if (dateKey === today) continue;
        if (!dailyMap[dateKey] || Math.abs(hour - 12) < Math.abs(new Date(dailyMap[dateKey].dt * 1000).getHours() - 12)) {
            dailyMap[dateKey] = item;
        }
    }

    const days = Object.values(dailyMap).slice(0, 3);
    const rows = document.querySelectorAll('.forecast-row');

    days.forEach((item, i) => {
        if (!rows[i]) return;
        const dt = new Date(item.dt * 1000);
        const iconCode = item.weather[0].icon;
        const desc = translateDesc(item.weather[0].description);
        const temp = Math.round(item.main.temp);

        rows[i].querySelector('.f-date').textContent = formatForecastDate(dt);
        const img = rows[i].querySelector('img');
        img.src = getLocalIcon(iconCode);
        img.alt = desc;
        rows[i].querySelector('.f-status').textContent = desc;
        rows[i].querySelector('.f-temp').textContent = `${temp}°C`;
    });
}

function showError(msg) {
    document.getElementById('weather-desc').textContent = msg;
    document.getElementById('weather-desc').style.color = '#e74c3c';
}

async function init() {
    startClock();
    try {
        const [current, forecast] = await Promise.all([
            fetchCurrentWeather(DEFAULT_CITY),
            fetchForecast(DEFAULT_CITY)
        ]);
        updateCurrentWeather(current);
        updateForecast(forecast);
    } catch (err) {
        showError('⚠ Không thể tải dữ liệu. Kiểm tra API key hoặc kết nối mạng.');
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', init);
