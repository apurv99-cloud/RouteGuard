import joblib
import polyline
import pandas as pd
from flask import Flask, request, jsonify
from geopy.distance import geodesic

app = Flask(__name__)

# Load the model
try:
    model = joblib.load("model.joblib")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def compute_length(coords):
    total = 0
    for i in range(len(coords)-1):
        total += geodesic(coords[i], coords[i+1]).meters
    return total

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
        
    data = request.get_json()
    
    try:
        origin_lat = data.get("origin_lat")
        origin_lon = data.get("origin_lon")
        dest_lat = data.get("dest_lat")
        dest_lon = data.get("dest_lon")
        duration_s = data.get("duration_s")
        polyline_str = data.get("polyline")
        
        if None in [origin_lat, origin_lon, dest_lat, dest_lon, duration_s, polyline_str]:
            return jsonify({"error": "Missing required fields"}), 400
            
        # Feature Engineering
        coords = polyline.decode(polyline_str)
        route_length_m = compute_length(coords)
        
        start = (origin_lat, origin_lon)
        end = (dest_lat, dest_lon)
        straight_dist_m = geodesic(start, end).meters
        
        efficiency_ratio = straight_dist_m / route_length_m if route_length_m > 0 else 0
        avg_speed_mps = route_length_m / duration_s if duration_s > 0 else 0
        
        # Prepare feature matrix
        features = pd.DataFrame([{
            "avg_speed_mps": avg_speed_mps,
            "route_length_m": route_length_m,
            "straight_dist_m": straight_dist_m,
            "efficiency_ratio": efficiency_ratio
        }])
        
        # Prediction
        anomaly_prediction = int(model.predict(features)[0]) # 1 for normal, -1 for anomaly
        anomaly_score = float(model.decision_function(features)[0])
        
        # In Isolation Forest: 1 is normal, -1 is anomaly
        # For the users, let's make it more intuitive
        is_anomaly = True if anomaly_prediction == -1 else False
        
        return jsonify({
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "features": {
                "avg_speed_mps": avg_speed_mps,
                "route_length_m": route_length_m,
                "straight_dist_m": straight_dist_m,
                "efficiency_ratio": efficiency_ratio
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
