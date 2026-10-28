import pandas as pd
from statsmodels.tsa.arima.model import ARIMA # type: ignore
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "backend/market/data/market_prices.csv"

def forecast_prices(crop):
    try:
        df = pd.read_csv(DATA_PATH)

        # Filter selected crop
        crop_data = df[df["crop"] == crop]

        if crop_data.empty:
            return None

        series = crop_data["price"].astype(float)

        # Train ARIMA
        model = ARIMA(series, order=(2, 1, 2))
        model_fit = model.fit()

        # Forecast next 3 months
        forecast = model_fit.forecast(steps=3)

        return [round(p, 2) for p in forecast]

    except Exception as e:
        print("ARIMA Error:", e)
        return None
