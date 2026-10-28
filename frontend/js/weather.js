document.getElementById("weatherForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const temperature = parseFloat(document.getElementById("temperature").value);
    const humidity = parseFloat(document.getElementById("humidity").value);

    // Send data to Django backend
    fetch("http://127.0.0.1:8000/api/weather/predict/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `temperature=${temperature}&humidity=${humidity}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Build weather message from backend response
        let weatherMessage = `
            ${data.condition}<br>
            🌧️ <b>Rainfall:</b> ${data.rainfall_probability} mm<br>
        `;

        // Add crop recommendations if available
        if (data.recommended_crops && data.recommended_crops.length > 0) {
            const cropList = data.recommended_crops
                .map(crop => `${crop}<br>`)
                .join("");
            
            weatherMessage += `
                <br><b>🌱 Recommended Crops:</b>
                <ul>${cropList}</ul>
            `;
        }

        const resultCard = document.getElementById("resultCard");
        const resultText = document.getElementById("resultText");

        resultText.innerHTML = weatherMessage;
        resultCard.style.display = "block";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to get prediction from the server. Check backend or CORS settings.");
    });
});
