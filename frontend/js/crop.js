// js/crop.js

document.getElementById("soilForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Get input values
    const N = document.getElementById("nitrogen").value;
    const P = document.getElementById("phosphorous").value;
    const K = document.getElementById("potassium").value;
    const pH = document.getElementById("ph").value;
    const Moisture = document.getElementById("moisture").value;

    // Show loading text
    const resultCard = document.getElementById("resultCard");
    const resultText = document.getElementById("resultText");
    resultCard.style.display = "block";
    resultText.textContent = "Analyzing your soil data... 🌱";

    try {
        // Send data to Django backend
        const response = await fetch("http://127.0.0.1:8000/api/crop_recommendation/recommend/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ N, P, K, pH, Moisture })
        });

        const data = await response.json();

        if (data.crop && data.fertilizer) {
            resultText.innerHTML = `
                <strong>Recommended Crop:</strong> ${data.crop}<br>
                <strong>Recommended Fertilizer:</strong> ${data.fertilizer}
            `;
        } else {
            resultText.innerHTML = `<span style="color:red;">Error: ${data.error || 'Unable to get recommendation'}</span>`;
        }

    } catch (error) {
        console.error("Error:", error);
        resultText.innerHTML = `<span style="color:red;">Server not responding. Please check backend connection.</span>`;
    }
});
