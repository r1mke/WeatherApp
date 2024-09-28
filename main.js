async function getWeather(search){
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=58ef2a49adbf49858440d7ca318df770`
    const method = {
        method: 'GET'
    }

    const response = await fetch(apiUrl, method)
    const data = await response.json()
    console.log(data)

    const hourForecast = data.list ;
    
    await getTime(data.city.coord.lat, data.city.coord.lon);


    document.querySelector(".city").innerHTML = data.city.name+", "+data.city.country;
    document.querySelector(".weatherDesc").innerHTML = capitalizeFirstLetter(data.list[0].weather[0].description);
    document.querySelector(".todayIcon").src = `http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png` 
    document.querySelector(".todayTemperature").innerHTML = Math.round(data.list[0].main.temp-273.15) + "°C";
    document.querySelector(".realFell").innerHTML = "Real fell: " + Math.round(data.list[0].main.feels_like-273.15) + "°C";
    document.querySelector(".humidity").innerHTML ="Humidity: " + data.list[0].main.humidity + "%";
    document.querySelector(".wind").innerHTML ="Wind: " + data.list[0].wind.speed + "m/s";
    const {min,max} = getMinMax(hourForecast.slice(0,8));
    document.querySelector(".high").innerHTML ="High: " + max + "°C";
    document.querySelector(".low").innerHTML ="Low: " + min + "°C";
    showHourlyForecast(hourForecast.slice(0,5));
    const days = {dayOne : hourForecast.slice(8,16),
        dayTwo : hourForecast.slice(16,24),
        dayThree : hourForecast.slice(24,32),
        dayFour : hourForecast.slice(32,40)}
    showDailyForecast(days);

}

async function getTime(lat,lng){
    const apiUrl = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=r1mke`

    const method = {
        method: 'GET'
    }


    const response = await fetch(apiUrl, method)
    const data = await response.json()
    console.log(data)

    const {date, dayName} = formatDate(data.time);
    document.querySelector(".date").innerHTML = date;

    const formattedTime = formatTime(data.time); 

document.querySelector(".time span").innerHTML = `Local time: ${formattedTime}`; // Sada koristi funkciju

const sunriseFormatted = formatTime(data.sunrise);
const sunsetFormatted = formatTime(data.sunset);

document.querySelector(".rise").innerHTML = "Sunrise: " + sunriseFormatted;
document.querySelector(".set").innerHTML = "Sunset: " + sunsetFormatted;

}


window.onload =  () => {
    getWeather('London')
}

document.querySelector(".seachIcon").addEventListener("click", () => {
   getWeather(document.querySelector(".search-bar").value)
})

document.querySelector(".search-bar").addEventListener("keyup", (event) => {
   if(event.key === "Enter"){
       getWeather(document.querySelector(".search-bar").value)
   }
})

function capitalizeFirstLetter(string) {
    if (string.length === 0) return string; 
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatTime(datetime) {
    const [datePart, timePart] = datetime.split(" ");
    const [hours, minutes] = timePart.split(":");
    return `${hours}:${minutes}`; 
}

function showHourlyForecast(hourForecast){
    const container = document.querySelector(".hourlyForecastContainer");
    container.innerHTML = ``;
    hourForecast.forEach(element => {
       
        const item = `<div class="hourlyForeCastItem">
                        <span class="time">${formatTime(element.dt_txt)}</span>
                        <img src="http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png" width="50px" height="50px">
                        <span class="temp">${Math.round(element.main.temp-273.15)}°</span>
                    </div>`;
        container.innerHTML += item;
                    
    })
}

function getMinMax(intervals){
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let maxTempInterval = null;
    intervals.forEach(element => {
        const temp = Math.round(element.main.temp - 273.15);

        if (temp < minTemp) {
            minTemp = temp;
        }

        if (temp > maxTemp) {
            maxTemp = temp;
            maxTempInterval = element;
        }
    });

    return {min: minTemp, max: maxTemp,  maxTempInterval: maxTempInterval};    
}

function formatDate(datetime) {
    const [datePart] = datetime.split(" ");

    const [year, month, day] = datePart.split("-");
    const date = new Date(year, month - 1, day); 

    const optionsDate = { weekday: 'long' }; 
    const dayName = date.toLocaleDateString('en-GB', optionsDate); 

    const formattedDate = `${dayName}, ${day.padStart(2, '0')}.${month.padStart(2, '0')}`;

    return {
        date: formattedDate,
        dayName: dayName
    }
    
}

function showDailyForecast(days){
    const container = document.querySelector(".dailyForecastContainer");
    container.innerHTML = ``;
    Object.entries(days).forEach(([dayKey, intervals]) => {
        const { min, max, maxTempInterval } = getMinMax(intervals);
        console.log(intervals)
        const { date, dayName } = formatDate(intervals[0].dt_txt); 
        const item = `<div class="dailyForeCastItem">
                        <span class="date">${dayName}</span>
                        <img src="http://openweathermap.org/img/wn/${intervals[0].weather[0].icon}@2x.png" width="50px" height="50px">
                        <span class="temp">${min}° - ${max}°</span>
                    </div>`;
        container.innerHTML += item;
    });
}    