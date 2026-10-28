window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("marketForm");
    const resultCard = document.getElementById("resultCard");
    const ctx = document.getElementById("priceChart").getContext("2d");

    let chart = null;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const crop = document.getElementById("crop").value;
        const month = document.getElementById("month").value;

        if (!crop || !month) return;

        fetch(`http://127.0.0.1:8000/api/market/predict/?crop=${crop}&month=${month}`)
            .then(res => res.json())
            .then(data => {
                console.log("API DATA:", data);

                if (data.error) {
                    alert(data.error);
                    return;
                }

                resultCard.style.display = "block";

                const pastPrices = data.past_prices.map(Number);
                const predictedPrices = data.predicted_prices.map(Number);
                const labels = data.labels;

                drawChart(labels, pastPrices, predictedPrices);
                showRecommendation(pastPrices, predictedPrices);
            })
            .catch(err => console.error("Error fetching market data:", err));
    });

    function drawChart(labels, past, predicted) {
        if (chart) chart.destroy();

        const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

        const lastMonth = labels[labels.length - 1];
        const lastIndex = monthOrder.indexOf(lastMonth);

        const futureMonths = [
            monthOrder[(lastIndex + 1) % 12],
            monthOrder[(lastIndex + 2) % 12],
            monthOrder[(lastIndex + 3) % 12]
        ];

        const allLabels = [...labels, ...futureMonths];
        const pastData = [...past, null, null, null];
        const predictedData = new Array(past.length).fill(null).concat(predicted);

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: "Past Price",
                        data: pastData,
                        borderColor: "#16a34a",          // ✅ green line
                        backgroundColor: "rgba(22,163,74,0.2)", // ✅ light green fill
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: "#16a34a"
                    },
                    {
                        label: "Predicted Price",
                        data: predictedData,
                        borderColor: "#f59e0b",          // ✅ orange line
                        backgroundColor: "rgba(245,158,11,0.2)", // ✅ light orange fill
                        tension: 0.4,
                        fill: true,
                        borderDash: [6, 6],
                        pointRadius: 4,
                        pointBackgroundColor: "#f59e0b"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            font: { size: 14 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function showRecommendation(pastPrices, predictedPrices) {
        const recommendation = document.getElementById("recommendation");

        const lastPast = pastPrices.filter(v => v !== null).slice(-1)[0];
        const lastPredicted = predictedPrices.filter(v => v !== null).slice(-1)[0];

        recommendation.textContent =
            lastPredicted > lastPast
            ? "📈 Predicted price is High — you can sell in the market now for good profit."
            : "📉 Predicted price is Low — hold the stock and wait for a better price.";
    }
});