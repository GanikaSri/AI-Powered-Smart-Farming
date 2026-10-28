function getStorageAdvice(event) {
    event.preventDefault();

    const crop = document.getElementById("crop").value;
    const weather = document.getElementById("weather").value;
    const storage = document.getElementById("storage").value;

    const url = "http://127.0.0.1:8000/api/storage/recommend/?crop=" 
                + crop + "&weather=" + weather + "&storage=" + storage;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error("Server Error");
        }
        return response.json();
    })
    .then(data => {
        console.log("API Data:", data);

        // If backend returns error
        if (data.error) {
            document.getElementById("result").innerHTML =
                "<p style='color:red;'>Error: " + data.error + "</p>";
            document.getElementById("resultCard").style.display = "block";
            return;
        }

        // Show result
        document.getElementById("result").innerHTML =
            "<p><b>Crop:</b> " + data.crop + "</p>" +
            "<p><b>Current Price:</b> ₹" + data.current_price + "</p>" +
            "<p><b>Predicted Price:</b> ₹" + data.predicted_price + "</p>" +
            "<p><b>Storage Method:</b> " + data.storage_method + "</p>" +
            "<p><b>Decision:</b> " + data.decision + "</p>" +
            "<p><b>Store Days:</b> " + data.store_days + "</p>" +
            "<p><b>Expected Profit:</b> ₹" + data.expected_profit + "/kg</p>";

        document.getElementById("resultCard").style.display = "block";
    })
    .catch(error => {
        console.log("Fetch Error:", error);
        document.getElementById("result").innerHTML =
            "<p style='color:red;'>Failed to connect to server</p>";
        document.getElementById("resultCard").style.display = "block";
    });
}