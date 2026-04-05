# Supply Chain Management System

A comprehensive supply chain management application that tracks vehicle trips, detects route anomalies using machine learning, and provides real-time monitoring through a web dashboard.



## Architecture

The application consists of four main components:

1. **Frontend** - React-based web interface with interactive maps and analytics dashboard
2. **Backend** - Spring Boot REST API handling business logic and data persistence
3. **ML Service** - Python Flask service for anomaly detection using Isolation Forest
4. **Database** - PostgreSQL for data storage

## Features

### Trip Management
- Register and track vehicle trips with GPS coordinates
- Store trip routes as encoded polylines
- Monitor trip status (ONGOING, COMPLETED, DEVIATED)

### Anomaly Detection
- Machine learning-based route deviation detection
- Real-time trip evaluation using Isolation Forest algorithm
- Automated classification of anomalous trips

### Dashboard Analytics
- Interactive map visualization using Leaflet
- Trip statistics and performance metrics
- Real-time monitoring of fleet operations

### API Endpoints

#### Trip Operations
- `GET /trips` - Retrieve all trips
- `GET /trips/{id}` - Get specific trip details
- `POST /trips` - Create new trip
- `POST /trips/{id}/complete` - Complete and evaluate trip

#### ML Analysis
- `GET /ml/check/{tripId}` - Check if trip is anomalous
- `GET /ml/summary` - Get trip statistics summary
- `POST /ml/predict` - Direct ML prediction endpoint

#### GPS Tracking
- `GET /gps` - Get all GPS points
- `POST /gps` - Add GPS coordinate

## Technology Stack

### Backend
- Java
- Spring Boot 
- Spring Data JPA
- PostgreSQL
- Maven

### Frontend
- React
- Vite
- Tailwind CSS 
- Leaflet (maps)
- Recharts (charts)

### ML Service
- Python
- Flask
- scikit-learn (Isolation Forest)
- joblib
- pandas
- geopy
- polyline

### Infrastructure
- Docker & Docker Compose
- Kubernetes
- Jenkins (CI/CD)
- Nginx (frontend serving)

## Local Development Setup

### Prerequisites
- Docker and Docker Compose
- Java 17
- Node.js 18+
- Python 3.8+

### Quick Start with Docker

1. Clone the repository
2. Navigate to project root
3. Run the application stack:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 8081
- Frontend on port 80
- ML service on port 8000

### Manual Setup

#### Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### ML Service Setup
```bash
cd SupplyChainMapping
pip install -r requirements.txt
python app.py
```

## Configuration

### Environment Variables

#### Backend (.env or application.properties)
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/techs
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_PROFILES_ACTIVE=dev
```

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
```

## Database Schema

### Trip Entity
- id: Primary key
- originLat/originLon: Starting coordinates
- destLat/destLon: Destination coordinates
- durationS: Trip duration in seconds
- polyline: Encoded route polyline
- status: TripStatus enum (ONGOING, COMPLETED, DEVIATED)

### GPS Entity
- id: Primary key
- tripId: Foreign key to Trip
- latitude/longitude: GPS coordinates
- timestamp: Recording time

## ML Model Training

The anomaly detection model is trained using Isolation Forest on trip data features:

1. Route efficiency ratio (straight line vs actual distance)
2. Average speed
3. Trip duration
4. Geographic coordinates



### Model Files
- `model.joblib` - Trained Isolation Forest model
- `IsolateForest.ipynb` - Training notebook

## Deployment

### Docker Images
- Frontend: `supply-chain-frontend`
- Backend: `supply-chain-backend`
- ML Service: `supply-chain-ml`

### Kubernetes Deployment
The application can be deployed to Kubernetes using manifests in the `K8s/` directory:

```bash
kubectl apply -f K8s/
```

Components include:
- Namespace isolation
- Deployments with resource limits
- Services for inter-pod communication
- Horizontal Pod Autoscaling
- Persistent volumes for ML models

### CI/CD Pipeline
Jenkins pipeline automates:
- Code checkout
- Docker image building
- Image tagging and pushing to registry
- Kubernetes deployment updates

## API Usage Examples

### Create a Trip
```bash
curl -X POST http://localhost:8080/trips \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 28.6139,
    "originLon": 77.2090,
    "destLat": 28.5355,
    "destLon": 77.3910,
    "durationS": 3600,
    "polyline": "encoded_polyline_string"
  }'
```

### Check Trip Anomaly
```bash
curl http://localhost:8080/ml/check/1
```

### Get Trip Summary
```bash
curl http://localhost:8080/ml/summary
```

## Development Guidelines

### Code Style
- Backend: Follow Spring Boot conventions
- Frontend: ESLint configuration provided
- Python: PEP 8 standards

### Testing
- Backend: JUnit 5 for unit tests
- Frontend: Manual testing (no test framework configured)
- ML: Manual validation of predictions

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with proper commit messages
4. Test locally
5. Submit pull request

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 5432, 8000, 8081 are available
2. **Database connection**: Verify PostgreSQL credentials in docker-compose.yml
3. **ML model loading**: Check model.joblib exists in SupplyChainMapping/
4. **CORS errors**: Backend has CORS configuration for frontend communication

### Logs
- Backend logs: `docker logs hackjmi-backend`
- Frontend build logs: Check browser console
- ML service logs: `docker logs hackjmi-ml`
