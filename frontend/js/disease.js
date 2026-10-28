const form = document.getElementById("diseaseForm");
const previewImage = document.getElementById("previewImage");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const leafInput = document.getElementById("leafImage");

// Preview uploaded image
leafInput.addEventListener("change", () => {
    const file = leafInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        previewImage.src = reader.result;
        previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);
});

// Submit image for prediction
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const file = leafInput.files[0];
    if (!file) {
        alert("Please upload a leaf image");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    resultText.innerHTML = "🔍 Analyzing leaf image...";
    resultCard.style.display = "block";

    fetch("http://127.0.0.1:8000/api/crop-disease/detect/", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            resultText.innerHTML = "❌ " + data.error;
            return;
        }

          // LOW CONFIDENCE
    if (data.message) {
        resultText.innerHTML = `
            ⚠️ <strong>${data.message}</strong><br>

        `;
        return;
    }

    // NORMAL SUCCESS CASE
    resultText.innerHTML = `
        🌱 <strong>Crop:</strong> ${data.crop}<br>
        🌾 <strong>Disease:</strong> ${data.disease}<br>
        💊 <strong>Treatment:</strong> ${data.treatment}<br>
        📊 <strong>Confidence:</strong> ${(data.confidence * 100).toFixed(2)}%
    `;
})
    .catch(() => {
        resultText.innerHTML = "⚠️ Server error. Try again.";
    });
});
