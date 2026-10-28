document
  .getElementById("waterForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const moisture = document.getElementById("moisture").value;
    const rainfall = document.getElementById("rainForecast").value;
    const crop = document.getElementById("cropType").value;

    const res = await fetch("http://127.0.0.1:8000/api/water/predict/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moisture: moisture,
        rainfall: rainfall,
        crop: crop,
      }),
    });

    const data = await res.json();

    // SHOW CARD
    document.getElementById("resultCard").style.display = "block";

    // INSERT VALUES INTO HTML
    document.getElementById("resCrop").innerText = data.crop;
    document.getElementById("resStatus").innerText = data.status;
    document.getElementById("resWater").innerText = data.water;
    document.getElementById("resNext").innerText = data.next_days;
    document.getElementById("resReason").innerText = data.reason;
  });
