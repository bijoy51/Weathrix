# import sys
# import json
# import datetime
# import xarray as xr
# import numpy as np
# from tensorflow import keras

# # Helper: "lat,lon" string → float lat, lon
# def parse_location(locstr):
#     parts = locstr.split(",")
#     if len(parts) == 2:
#         return float(parts[0]), float(parts[1])
#     raise ValueError("Location must be lat,lon")

# # Historical MERRA-2 fetch (simplified example)
# def fetch_merra_timeseries(lat, lon, startDate, endDate):
#     start = datetime.date.fromisoformat(startDate)
#     end = datetime.date.fromisoformat(endDate)
#     delta = datetime.timedelta(days=1)

#     dates, temps, winds, rains, hums = [], [], [], [], []

#     cur = start
#     while cur <= end:
#         # এখানে OPeNDAP/MERRA-2 API ব্যবহার করে subset নিতে হবে
#         # উদাহরণ হিসেবে dummy random data
#         dates.append(cur.isoformat())
#         temps.append(round(15 + np.random.randn(), 1))
#         winds.append(round(5 + np.random.rand()*3,1))
#         rains.append(round(np.random.rand()*2,1))
#         hums.append(round(60 + np.random.rand()*20,1))
#         cur += delta

#     return {"dates": dates, "temps": temps, "winds": winds, "rains": rains, "hums": hums}

# # Simple ML prediction model (toy LSTM)
# def predict_future(lat, lon, startDate, endDate):
#     # historical dummy
#     hist = fetch_merra_timeseries(lat, lon, "2000-01-01", "2000-12-31")
#     series = np.array(hist["temps"]).reshape(-1,1)

#     # LSTM model
#     model = keras.Sequential([
#         keras.layers.LSTM(10, input_shape=(1,1)),
#         keras.layers.Dense(1)
#     ])
#     model.compile(loss="mse", optimizer="adam")
#     # reshape for LSTM: (samples, timesteps, features)
#     X = series[:-1].reshape(-1,1,1)
#     y = series[1:]
#     model.fit(X, y, epochs=5, verbose=0)

#     # predict for each day in user range
#     start = datetime.date.fromisoformat(startDate)
#     end = datetime.date.fromisoformat(endDate)
#     delta = datetime.timedelta(days=1)
#     cur = start

#     future = []
#     while cur <= end:
#         x_input = series[-1].reshape(1,1,1)
#         pred = model.predict(x_input, verbose=0)[0][0]
#         future.append({"date": cur.isoformat(), "temp": round(pred,1),
#                        "wind": round(5 + np.random.rand()*3,1),
#                        "rain": round(np.random.rand()*2,1),
#                        "humidity": round(60 + np.random.rand()*20,1)})
#         cur += delta
#     return future

# def main():
#     location, startDate, endDate = sys.argv[1], sys.argv[2], sys.argv[3]
#     lat, lon = parse_location(location)

#     # Historical table: last 20 years on same date range
#     pastTable = []
#     for year_back in range(1,6):  # demo: last 5 years
#         s = datetime.date.fromisoformat(startDate) - datetime.timedelta(days=365*year_back)
#         e = datetime.date.fromisoformat(endDate) - datetime.timedelta(days=365*year_back)
#         hist = fetch_merra_timeseries(lat, lon, s.isoformat(), e.isoformat())
#         for i in range(len(hist["dates"])):
#             pastTable.append({"date": hist["dates"][i],
#                               "temp": hist["temps"][i],
#                               "wind": hist["winds"][i],
#                               "rain": hist["rains"][i],
#                               "humidity": hist["hums"][i]})

#     # Future prediction
#     futureTable = predict_future(lat, lon, startDate, endDate)

#     print(json.dumps({"pastTable": pastTable, "futureTable": futureTable}))

# if __name__ == "__main__":
#     main()
