A fully-featured backend for an Airbnb-style booking platform, supporting **Places**, **Experiences**, **Services**, **Bookings**, **Wishlist**, and full **Authentication/Authorization**.  
Built using **Node.js**, **Express**, **MongoDB**, and modern backend engineering patterns.

---

## Key Features

### Authentication & Authorization
- JWT-based authentication using **http-only cookies**.
- Role-based access: **customer** and **host**.
- Middleware-level protection for private and host-only routes.

### Place Management
- Complete CRUD for property listings.
- Supports multiple image uploads via **Cloudinary**.
- Filtering & search support.

### Experiences & Services
- Dedicated models for curated **Experiences** and platform **Services**.
- Public routes for discovering experiences/services.

### Booking System
- Booking creation, cancellation, reviews.
- Refund request endpoints.
- Automatic booking status transitions:
  - pending  
  - confirmed  
  - expired  
  - canceled

### Geocoding & Location
- Integrated **OpenStreetMap Nominatim API** (proxied)
- Location search and reverse geocoding.

### Wishlist
- Add/remove places from wishlist.
- Retrieve all wishlist items for a user.

### Data Seeding
- Included seeding scripts:
  - Places
  - Experiences
  - Services

### Validation
- **Zod** used for robust request validation:
  - User creation  
  - Place creation  
  - Booking creation  

---

## 🛠️ Tech Stack

| Category | Technology |
|---------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | bcryptjs, jsonwebtoken |
| File Storage | Cloudinary |
| Geocoding | Nominatim (OpenStreetMap) |
| Validation | Zod |
| Utilities | CORS, dotenv, cookie-parser |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- SMTP provider (optional for email receipts)

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/kalyadapuvamshikrishna/kalyadapuvamshikrishna-airbnb_api.git
cd kalyadapuvamshikrishna-airbnb_api
2. Install dependencies
bash
Copy code
npm install
3. Configure environment variables
Create a .env file:

env
Copy code
# MongoDB
MONGO_URL="mongodb://localhost:27017/airbnb-clone"

# JWT Secret
JWT_SECRET="supersecret"

# Cloudinary Config
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Server Port
PORT=4000

# CORS Allowed Origins
ALLOWED_ORIGINS="http://localhost:5173,https://domio-client.vercel.app"

# SMTP for Emails (Optional)
# SMTP_HOST="smtp.ethereal.email"
# SMTP_PORT=587
# SMTP_USER="your_email"
# SMTP_PASS="your_password"
📦 Database Seeding (Optional)
Make sure you have at least one user created manually to act as a place owner.

bash
Copy code
# Seed core services
node seedServices.js

# Seed mock places
node seedPlaces.js

# Seed experiences
node seedExperience.js
🏃 Running the Server
Development:
bash
Copy code
npm run dev
Production:
bash
Copy code
npm start
By default, the server runs on:
http://localhost:4000

🗺️ API Endpoints Overview
Authentication
Method	Endpoint	Description	Access
POST	/api/register	Register a new user	Public
POST	/api/login	Log in (sets cookie)	Public
GET	/api/profile	Get current user profile	Private
POST	/api/logout	Clear token cookies	Private
POST	/api/users/become-host	Update user role to host	Private

Places
Method	Endpoint	Description	Access
POST	/api/places	Create a new place	Host
PUT	/api/places/:id	Update an existing place	Host
GET	/api/places	Get all places (filters/search)	Public
GET	/api/places/:id	Get a place by ID	Public
GET	/api/user-places	Get places owned by the host	Host
DELETE	/api/places/:id	Delete a place	Host

Wishlist
Method	Endpoint	Description	Access
POST	/api/places/:id/toggle-wishlist	Add/remove a wishlist item	Private
GET	/api/wishlist	Get all wishlist items	Private

Bookings
Method	Endpoint	Description	Access
POST	/api/bookings	Create a booking	Private
GET	/api/bookings	Get all user bookings	Private
GET	/api/bookings/:id	Get a single booking	Private
DELETE	/api/bookings/:id	Cancel a booking	Private
POST	/api/bookings/:id/refund	Request a refund	Private
POST	/api/bookings/:id/review	Submit a review	Private

Uploads
Method	Endpoint	Description	Access
POST	/api/upload-by-link	Upload image via URL	Private
POST	/api/upload	Upload photos from form data	Private

Experiences
Method	Endpoint	Description	Access
GET	/api/experiences	Get all experiences	Public
GET	/api/experiences/:id	Get an experience by ID	Public

Services
Method	Endpoint	Description	Access
GET	/api/services	Get all services	Public
GET	/api/services/:id	Get a service by ID	Public

Geocoding
Method	Endpoint	Description	Access
GET	/api/search-location?q=	Search for a location by query string	Public
GET	/api/reverse-geocode?lat=&lon=	Reverse geocode coordinates	Public

📁 Project Directory Structure
bash
Copy code
kalyadapuvamshikrishna-airbnb_api/
│
├── package.json
├── server.js                # Entry point
├── .env.example
│
├── controllers/             # Controllers for each resource
├── routes/                  # Route definitions
├── models/                  # Mongoose models
├── services/                # Complex business logic
├── middlewares/             # Auth, role, multer, validators
├── data/                    # Static JSON/data files
│
├── seedPlaces.js            # Seed mock place data
├── seedExperience.js        # Seed mock experience data
├── seedServices.js          # Seed static service data
│
└── .github/workflows/       # CI/CD / maintenance automation
