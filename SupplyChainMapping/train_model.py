import pandas as pd
import polyline
import joblib
from sklearn.ensemble import IsolationForest
from geopy.distance import geodesic

def compute_length(coords):
    total = 0
    for i in range(len(coords)-1):
        total += geodesic(coords[i], coords[i+1]).meters
    return total

def train_and_save_model(csv_path, model_path):
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Feature Engineering
    print("Performing feature engineering...")
    df["coordinates"] = df["polyline"].apply(polyline.decode)
    df["route_length_m"] = df["coordinates"].apply(compute_length)
    
    straight_distances = []
    for index, row in df.iterrows():
        start = (row["origin_lat"], row["origin_lon"])
        end   = (row["dest_lat"], row["dest_lon"])
        distance = geodesic(start, end).meters
        straight_distances.append(distance)
        
    df["straight_dist_m"] = straight_distances
    df["efficiency_ratio"] = df["straight_dist_m"] / df["route_length_m"]
    df["avg_speed_mps"] = df["route_length_m"] / df["duration_s"]
    
    # Select features
    features = df[[
        "avg_speed_mps",
        "route_length_m",
        "straight_dist_m",
        "efficiency_ratio"
    ]]
    
    # Handle NaNs or Infs if any
    features = features.replace([float('inf'), float('-inf')], 0).fillna(0)
    
    print("Training Isolation Forest model...")
    model = IsolationForest(
        contamination=0.05,
        random_state=42
    )
    model.fit(features)
    
    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    print("Done.")

if __name__ == "__main__":
    train_and_save_model("trip_data.csv", "model.joblib")
