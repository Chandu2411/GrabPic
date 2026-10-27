# 📸 GrabPic — AI-Powered Event Photo Finder

> **Find yourself in hundreds of event photos in seconds using AI face recognition.**

---

## 🌟 What is GrabPic?

Imagine you just attended a wedding, college fest, or marathon where the official photographer took **over 2,000 photos**. 

In the past, you'd have to scroll through endless Google Drive folders or albums looking for yourself.

**GrabPic solves this completely:**
1. **Event Organizers** upload the event photos in one go.
2. **Attendees** open the event link, upload 1–4 selfies, and click **Search**.
3. **AI** finds every single photo containing their face in seconds, categorized into high-confidence matches and probable matches, with one-click full-resolution downloading!

---

## ⚡ How It Works (In 3 Simple Steps)

```
  1. Organizer creates event      2. Attendees upload selfies      3. AI instantly finds photos!
  ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
  │ 📁 Upload event gallery │───>│ 🤳 Upload 1-4 selfies   │───>│ 🎯 View & download your │
  │    (AI indexes faces)   │    │    (Multi-angle fusion) │    │    matched photos & ZIP │
  └─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

---

## 🧠 How the AI Works (Student & Beginner Friendly)

If you are a student or developer curious about the AI engineering behind GrabPic, here is how the magic happens:

### 1. Face Detection (`InsightFace`)
When photos are uploaded, the AI detects all human faces in each image using deep learning neural networks.

### 2. Face Embeddings (512-Dimensional Vectors)
The AI converts each detected face into a mathematical fingerprint: a list of **512 floating-point numbers** called an **embedding vector**. Even if lighting or facial expression changes, embeddings for the same person remain close in vector space.

### 3. Vector Similarity Search (`FAISS`)
Instead of slowly comparing images pixel-by-pixel, GrabPic stores face vectors in **FAISS (Facebook AI Similarity Search)**. FAISS calculates the **Cosine Similarity** between your selfie's face vector and all the event photo face vectors in milliseconds.

### 4. Multi-Selfie Fusion
Uploading 2 to 4 selfies from slightly different angles (front, slight tilt, with/without glasses) creates multiple query vectors. GrabPic fuses the best scores across your selfies to give remarkably high match accuracy.

### 5. Smart Match Categorization
- 🟢 **Your Photos (Strong Matches)**: High similarity score ($\ge 0.65$) — almost certainly you.
- 🟡 **Maybe You (Weak Matches)**: Moderate similarity score ($0.50$ to $0.65$) — sideways angles, crowd shots, or distant views.

---

## 🏗️ System Architecture

GrabPic is engineered as a production-grade, 3-tier microservices architecture:

```
┌────────────────────────────────┐
│   FRONTEND (React 19 + Vite)   │  Cyberpunk / Retro aesthetic, drag & drop,
│   Port: 5173 / 5175            │  modal lightbox, instant photo download
└────────────────────────────────┘
                │
                ▼ (REST API)
┌────────────────────────────────┐
│   BACKEND (Spring Boot 3 / J21)│  Event management, signed URL security,
│   Port: 8080                   │  rate limiting, and Azure Blob integration
└────────────────────────────────┘
                │
                ▼ (Internal Microservice)
┌────────────────────────────────┐
│   AI SERVICE (FastAPI / Py3.11)│  InsightFace (Buffalo_L), FAISS vector index,
│   Port: 8000 / 8005            │  face detection, embedding extraction & search
└────────────────────────────────┘
```

| Service | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Framer Motion | Modern, responsive retro-tech UI |
| **Backend** | Spring Boot 3.3 (Java 21) | RESTful API, orchestration, security tokens |
| **AI Service** | FastAPI, Python 3.11, InsightFace, FAISS | Neural network inference & vector indexing |
| **Storage** | Local disk or Azure Blob Storage | Temporary event image & index storage |

---

## 🚀 Quick Start (Run with Docker)

The easiest way to run the entire application is with Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone the repository
```bash
git clone https://github.com/Chandu2411/GrabPic.git
cd GrabPic
```

### 2. Configure environment (Optional)
A default `.env` file is already included. You can adjust settings if needed:
```env
USE_BLOB_STORAGE=false
EVENT_EXPIRY_HOURS=10
AI_PUBLIC_BASE_URL=http://localhost:8000
IMAGE_TOKEN_SECRET=your-secret-key-change-in-production
```

### 3. Start all services
```bash
docker compose up -d --build
```

### 4. Open in your browser
- 🌐 **Frontend**: [http://localhost:5173](http://localhost:5173) *(or [http://localhost:5175](http://localhost:5175))*
- ⚙️ **Backend API**: [http://localhost:8080](http://localhost:8080)
- 🤖 **AI Service Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) *(or [http://localhost:8005/docs](http://localhost:8005/docs))*

---

## 🧪 Try It Out (Testing Walkthrough)

Sample images are provided inside the `samples/` directory so you can test immediately:

1. Open **[http://localhost:5173](http://localhost:5173)** and click **"Create Event"**.
2. Click **"Create Event"** to generate an Event ID.
3. In Step 2, drag & drop sample photos from `samples/` (e.g. `OIP.jpeg`, `roko.jpeg`, `OIP (1).jpeg`) and click **"Upload & Process"**.
4. Once indexing finishes, copy the event share link or click **"Open Event Page →"**.
5. On the attendee search page, upload `samples/roko.jpeg` as your selfie and click **"🔍 Search My Photos"**.
6. **Result:** GrabPic instantly identifies all photos containing that face with match confidence scores! Click any photo to preview full size or download individually or as a ZIP.

---

## 💻 Local Development (Running Without Docker)

If you wish to run each service individually for development:

### 1. Frontend
```bash
cd grabpic-frontend
npm install
npm run dev
# Live at http://localhost:5173
```

### 2. Backend
Requires Java 21:
```bash
cd backend
# Linux/macOS
./mvnw spring-boot:run
# Windows
.\mvnw.cmd spring-boot:run
# Or with installed Maven: mvn spring-boot:run
# Live at http://localhost:8080
```

### 3. AI Service
Requires Python 3.11+:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Live at http://localhost:8000
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/events` | Create a new event with auto-generated UUID |
| `POST` | `/events/{id}/upload` | Upload photos to an event for AI indexing |
| `GET` | `/events/{id}/status` | Check background indexing status (`processing`, `completed`) |
| `POST` | `/events/{id}/search` | Search event photos using 1–4 selfies |
| `GET` | `/events/{id}/download` | Download all event photos as a ZIP archive |
| `GET` | `/images/{id}/images/{file}?token=...` | Securely fetch a signed image URL |

---

## 📂 Project Structure

```
GrabPic/
├── ai-service/               # Python AI Microservice
│   ├── app/
│   │   ├── core/            # InsightFace detector, FAISS indexer, matcher
│   │   ├── services/        # Processing and multi-selfie fusion search
│   │   ├── utils/           # Image resizing & preprocessing
│   │   ├── config.py        # Settings & thresholds
│   │   └── main.py          # FastAPI application & endpoints
│   ├── Dockerfile
│   └── requirements.txt
│
├── backend/                  # Spring Boot Microservice
│   ├── src/main/java/com/grabpic/backend/
│   │   ├── config/          # CORS, RestTemplate, AI config properties
│   │   ├── controller/      # REST API endpoints (EventController)
│   │   ├── dto/             # SearchResponse & ImageMatch DTOs
│   │   └── service/         # Business logic, Token signing, Event service
│   ├── src/main/resources/  # application.properties
│   ├── pom.xml              # Maven configuration
│   └── Dockerfile
│
├── grabpic-frontend/         # React 19 + Vite Frontend
│   ├── src/
│   │   ├── api/             # Axios client & endpoints
│   │   ├── components/      # DropZone, ImageModal, RetroButton, PageWrapper
│   │   ├── pages/           # Home, CreateEvent, EventPage
│   │   └── index.css        # Cyberpunk retro aesthetic design system
│   ├── nginx.conf           # Production reverse-proxy config
│   ├── Dockerfile
│   └── package.json
│
├── samples/                  # Sample images for instant testing
├── docker-compose.yml        # Orchestration for all 3 microservices
└── README.md
```

---

## 🛡️ Security & Privacy

- **No Permanent Facial Data**: Face embeddings are held temporarily and deleted when the event expires.
- **HMAC Signed URLs**: Images are served through tamper-proof, time-limited signed tokens.
- **Auto-Expiry**: Events automatically delete after the configured duration (default: 10 hours).
- **Dual Storage**: Works with local storage out-of-the-box, with seamless Azure Blob Storage support for production.

---

## 👨‍💻 Author

Developed by **[Chandu2411](https://github.com/Chandu2411)**

⭐ Star this repository if you find it helpful for your learning or projects!
