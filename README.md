# 🔍 THE AI DETECTOR - Technical Documentation

A comprehensive documentation for the AI content detection platform. This document provides detailed technical information about the project structure, implementation details, and development guidelines.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Setup Guide](#setup-guide)
5. [API Documentation](#api-documentation)
6. [Development Guidelines](#development-guidelines)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-FF1C1C?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=darkgreen)](https://www.python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## Project Overview

### Technology Stack
- Frontend: React 18 + TypeScript
- Backend: FastAPI + Python 3.10
- Database: PostgreSQL
- ML Models: PyTorch + Hugging Face Transformers
- Authentication: JWT + bcrypt
- Monitoring: Prometheus + Custom Analytics

### Core Components
1. AI Detection Engine
2. User Authentication System
3. Analytics Dashboard
4. API Integration Layer
5. Monitoring System

## Screenshots

### Dashboard & Analysis
![Dashboard](./screnshots-README/dashboard.png)
*Modern dashboard with real-time analytics and user statistics*

### Analysis Interface
![Analysis Page](./screnshots-README/analysis.png)
*AI content detection interface with real-time results*

### Authentication Pages
![Login Page](./screnshots-README/LOGIN.png)
*Secure login with email authentication*

![Sign Up Page](./screnshots-README/SIGNUP.png)
*User registration with instant verification*

### Mobile Experience
![Mobile Navigation](./screnshots-README/mobile.png)
*Responsive mobile interface with bottom navigation*

### User Management
![Account Settings](./screnshots-README/settings.png)
*Comprehensive user settings and preferences*

### API Documentation
![API Keys](./screnshots-README/api-keys.png)
*API key management and usage tracking*

### Premium Features
![Subscription](./screnshots-README/subscription.png)
*Flexible subscription plans and billing management*

## Architecture

### System Architecture
```
[Client Layer]
    │
    ├── Web Interface (React)
    │   └── Mobile-Responsive UI
    │
    ├── API Layer (FastAPI)
    │   ├── Authentication
    │   ├── Analysis Engine
    │   └── User Management
    │
    └── Infrastructure
        ├── PostgreSQL Database
        ├── Redis Cache
        └── ML Model Server
```

### Data Flow
1. User Authentication Flow
2. Content Analysis Flow
3. API Integration Flow
4. Analytics Data Flow

## File Structure

### Backend Structure
```
backend/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── analytics.py        # Analytics endpoints
│   │   ├── analyze.py          # Analysis endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── shobeis.py         # Credits system
│   │   ├── subscriptions.py    # Subscription management
│   │   └── webhooks.py        # Webhook handlers
│   │
│   ├── models/                 # Database models
│   │   ├── action_cost.py     # Action cost tracking
│   │   ├── analysis_result.py # Analysis results
│   │   ├── analytics.py       # Analytics models
│   │   ├── analyzer.py        # Core analyzer
│   │   ├── blacklisted_token.py # Token management
│   │   ├── pricing.py         # Pricing models
│   │   ├── roberta_config.py  # ML model config
│   │   ├── user.py            # User model
│   │   └── user_analytics.py  # User analytics
│   │
│   ├── services/              # Business logic
│   │   ├── analytics_service.py
│   │   └── shobeis_service.py
│   │
│   └── utils/                 # Utilities
│       ├── batch_processor.py # Batch processing
│       ├── cache.py          # Caching system
│       ├── config.py         # Configuration
│       ├── database.py       # Database connection
│       ├── exceptions.py     # Custom exceptions
│       ├── monitoring.py     # Monitoring tools
│       ├── rate_limiter.py  # Rate limiting
│       ├── security.py      # Security utils
│       └── settings.py      # App settings
│
├── tests/                    # Test suite
│   ├── test_analyzer.py
│   ├── test_auth.py
│   ├── test_monitoring.py
│   └── test_session_management.py
│
└── migrations/              # Database migrations
    └── versions/

### UI Components & Styling

#### Dark Mode Interface
![Dark Mode](./screnshots-README/dark-mode.png)
*Sophisticated dark theme with accent colors*

#### Component Library
![Components](./screnshots-README/components.png)
*Custom component library with consistent styling*

#### Responsive Design
![Responsive](./screnshots-README/responsive.png)
*Fully responsive layout across all devices*

### Frontend Structure
```
frontend/
├── src/
│   ├── api/                 # API integration
│   │   ├── analytics.ts
│   │   ├── auth.ts
│   │   └── analysis.ts
│   │
│   ├── components/
│   │   ├── analytics/      # Analytics components
│   │   │   ├── ActivityList.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TimelineChart.tsx
│   │   │
│   │   ├── charts/        # Visualization
│   │   │   ├── LineChart.tsx
│   │   │   └── RadialChart.tsx
│   │   │
│   │   ├── features/      # Feature components
│   │   │   ├── analysis/
│   │   │   ├── auth/
│   │   │   └── subscription/
│   │   │
│   │   ├── layout/        # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── ui/           # UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   │
│   ├── context/          # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── AnalyticsContext.tsx
│   │   └── SettingsContext.tsx
│   │
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAnalytics.ts
│   │   └── useAPI.ts
│   │
│   ├── pages/          # Route pages
│   │   ├── analysis/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── settings/
│   │
│   ├── styles/        # Styling
│   │   ├── base.css
│   │   └── components.css
│   │
│   └── utils/        # Utilities
│       ├── api.ts
│       ├── formatting.ts
│       └── validation.ts
│
├── public/          # Static assets
└── config/         # Build configuration

### User Experience
- **Modern Interface**
  - Dark mode with accent theming
  - Responsive mobile-first design
  - Intuitive navigation
- **Account Management**
  - Secure authentication
  - Profile customization
  - Usage analytics
- **API Integration**
  - RESTful API access
  - API key management
  - Comprehensive documentation

## Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 13+
- Redis (optional, for caching)

### Environment Setup

1. **Backend Environment Variables**
```env
# Authentication
JWT_SECRET_KEY=your_jwt_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0

# API Configuration
CORS_ORIGINS=http://localhost:5173
API_V1_PREFIX=/api/v1
DEBUG=True

# ML Model
MODEL_PATH=models/roberta-base-openai-detector
MODEL_CACHE_DIR=.cache/models

# Monitoring
PROMETHEUS_MULTIPROC_DIR=/tmp/prom
LOG_LEVEL=INFO
```

2. **Frontend Environment Variables**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_ENV=development
VITE_SENTRY_DSN=your_sentry_dsn
```

### Installation Steps

1. **Backend Setup**
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

2. **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Guidelines

### Code Style

1. **Python Guidelines**
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Maximum line length: 88 characters (black)

Example:
```python
from typing import Optional

def analyze_text(
    content: str,
    max_length: Optional[int] = None
) -> dict:
    """
    Analyze text content for AI detection.

    Args:
        content (str): Text content to analyze
        max_length (Optional[int]): Maximum content length

    Returns:
        dict: Analysis results
    """
    pass
```

2. **TypeScript Guidelines**
- Use strict mode
- Follow ESLint configuration
- Use interfaces for type definitions
- Document complex functions

Example:
```typescript
interface AnalysisResult {
  score: number;
  confidence: number;
  details: {
    markers: string[];
    patterns: Pattern[];
  };
}

async function analyzeContent(text: string): Promise<AnalysisResult> {
  // Implementation
}

## API Documentation

### Authentication

1. **Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

2. **Register**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

### Content Analysis

1. **Analyze Text**
```http
POST /api/v1/analyze/text
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "options": {
    "detailed": boolean,
    "language": string
  }
}
```

2. **Batch Analysis**
```http
POST /api/v1/analyze/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "content": "string",
      "metadata": {}
    }
  ],
  "options": {
    "parallel": boolean,
    "detailed": boolean
  }
}
```

### Error Responses

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  },
  "requestId": "string"
}
```

## Testing

### Backend Testing

1. **Unit Tests**
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_analyzer.py

# Run with coverage
pytest --cov=app tests/
```

2. **Integration Tests**
```bash
# Run integration tests
pytest tests/integration/

# Run with specific marks
pytest -m "integration"
```

### Frontend Testing

1. **Unit Tests**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/analysis/__tests__/AnalysisResults.test.tsx

# Run with coverage
npm test -- --coverage
```

2. **E2E Tests**
```bash
# Run Cypress tests
npm run cypress:open

# Run headless
npm run cypress:run
```

### Test Structure

```
tests/
├── unit/                  # Unit tests
│   ├── test_analyzer.py
│   ├── test_auth.py
│   └── test_models.py
│
├── integration/           # Integration tests
│   ├── test_api.py
│   └── test_workflow.py
│
└── e2e/                  # End-to-end tests
    ├── test_analysis_flow.py
    └── test_auth_flow.py
```

## Deployment

### Production Setup

1. **Backend Deployment**
```bash
# Build Docker image
docker build -t ai-detector-api .

# Run with Docker Compose
docker-compose up -d
```

2. **Frontend Deployment**
```bash
# Build production bundle
npm run build

# Deploy to CDN/hosting
npm run deploy
```

### Docker Configuration
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ai_detector
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6
    volumes:
      - redis_data:/data
```

## Monitoring

### System Metrics

1. **Application Metrics**
- Request latency
- Error rates
- API endpoint usage
- ML model performance
- Resource utilization

2. **Business Metrics**
- User engagement
- Analysis volumes
- API usage
- Subscription status

### Logging System

1. **Log Levels**
```python
# Logging configuration
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'app.log',
            'level': 'ERROR',
        }
    }
}
```

2. **Log Categories**
- Authentication events
- Analysis operations
- System errors
- Performance issues
- Security alerts

### Health Checks

1. **Endpoint Health**
```http
GET /health
Content-Type: application/json

Response:
{
  "status": "healthy",
  "components": {
    "database": "up",
    "redis": "up",
    "ml_model": "up"
  },
  "version": "1.1.0"
}
```

## Troubleshooting

### Common Issues

1. **API Connection Issues**
```
Problem: API requests failing with 401
Solution: Check JWT token expiration and refresh token flow
```

2. **Database Connection**
```
Problem: Database connection errors
Solution: Verify connection string and credentials
```

3. **ML Model Issues**
```
Problem: Model loading errors
Solution: Check model path and cache directory permissions
```

### Debug Tools

1. **Backend Debugging**
```python
# Enable debug mode
DEBUG=True
LOG_LEVEL=DEBUG

# Run with debugger
python -m pdb app/main.py
```

2. **Frontend Debugging**
```bash
# Run with source maps
VITE_SOURCE_MAPS=true npm run dev

# Debug production build
npm run build -- --debug
```

### Performance Optimization

1. **API Optimization**
- Enable response compression
- Implement caching
- Use batch processing
- Optimize database queries

2. **Frontend Optimization**
- Code splitting
- Asset optimization
- Lazy loading
- Cache management

## � Security Features

- **Authentication**
  - JWT-based secure sessions
  - Multi-factor authentication ready
  - Rate limiting and protection
  - Session management

- **Data Security**
  - End-to-end encryption
  - Secure credential storage
  - Regular security audits
  - GDPR compliance ready

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.10+
- PostgreSQL 13+

### Installation

1. Clone and Setup
```bash
git clone https://github.com/boulahya01/the-ai-detector.git
cd the-ai-detector
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend Setup
```bash
cd frontend
npm install
```

4. Configure Environment
- Copy `.env.example` to `.env` in both frontend and backend
- Update configuration values

5. Start Development Servers
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to start using the application.

## 📚 Documentation

Comprehensive documentation is available at `/docs`:
- API Integration Guide
- User Guides
- Best Practices
- Integration Examples
- Troubleshooting

## 📦 Project Structure

Key directories and their purposes:

```
📂 ai-content-detector/
 ├── 📂 frontend/                # React application
 │   ├── 📂 src/
 │   │   ├── 📂 components/     # Reusable UI components
 │   │   ├── 📂 context/        # React contexts
 │   │   ├── 📂 hooks/          # Custom hooks
 │   │   └── 📂 pages/          # Route components
 │   └── 📂 public/             # Static assets
 │
 └── 📂 backend/                # FastAPI application
     ├── 📂 app/
     │   ├──  api/            # API endpoints
     │   ├── 📂 models/         # Data models
     │   └── 📂 utils/          # Utilities
     └── 📂 tests/              # Test suite
```

##  Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/boulahya01/ai-content-detector-v1.1.git
cd ai-content-detector-v1.1
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure Environment Variables

The application requires environment variables to be set up for both backend and frontend. Example configuration files are provided:

#### Backend Configuration
Copy `backend/.env.example` to `backend/.env` and configure:
- `JWT_SECRET_KEY`: Secret key for JWT token generation (keep this secure!)
- `JWT_REFRESH_SECRET_KEY`: Secret key for refresh tokens (keep this secure!)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes
- `DATABASE_URL`: Database connection string
- `FRONTEND_URL`: URL of the frontend application (for CORS)
- `SMTP_*`: Email configuration (optional, for notifications)

#### Frontend Configuration
Copy `frontend/.env.example` to `frontend/.env` and configure:
- `VITE_API_URL`: Backend API endpoint
- `VITE_JWT_EXPIRES_IN`: JWT token expiration time
- `VITE_REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration time

⚠️ **Security Notes**:
- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Keep production credentials strictly confidential
- Regularly rotate security keys and credentials

4. Additional Configuration
   - Configure logging levels in `utils/logging_config.py`
   - Set rate limits in `utils/rate_limiter.py`
   - Review CORS settings in `main.py` if needed

5. Frontend Setup
```bash
cd frontend
npm install  # or yarn install
```

### Running the Application

1. Initialize the Database
```bash
cd backend
# Run database migrations
alembic upgrade head
```

2. Start the Backend
```bash
# Start with monitoring and logging configuration
uvicorn app.main:app --reload --port 8000 --log-config utils/logging_config.py
```

3. Access Monitoring
   - Health check: `http://localhost:8000/health`
   - Metrics: `http://localhost:8000/metrics`
   - Logs: Check `backend/logs/` directory

3. Start the Frontend
```bash
cd frontend
npm run dev  # or yarn dev
```

The application will be available at `http://localhost:5173`

### Monitoring Setup

1. View System Health
   - GET `/health` for overall system status
   - GET `/metrics` for Prometheus metrics
   - Check log files in `backend/logs/`

2. Available Metrics
   - Request latency
   - Error rates
   - Detection confidence scores
   - Resource usage
   - Batch processing status

3. Log Files
   - `error.log`: Error-level messages
   - `info.log`: Information and warnings
   - `debug.log`: Detailed debugging info

##  Usage

1. **Analyze Content**
   - Visit the homepage
   - Enter text or upload a file (.txt, .docx)
   - Get instant AI detection results

2. **Premium Features** (requires login)
   - Save analysis history
   - Access advanced detection features
   - Manage subscription plans

##  Development Notes

### Provider Structure
```
AuthProvider
  └─ SubscriptionProvider
      └─ AnalysisProvider
          └─ Layout
              └─ Routes
```

### Known Issues & Fixes
- Fixed React render crash with Radix `Slot` (Button/Link pattern)
- Added comprehensive error boundaries
- Improved type checking and validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and contribution process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Hugging Face](https://huggingface.co/)
- [OpenAI](https://openai.com/)

---

<p align="center">
  <a href="https://theaidetector.com">Website</a> •
  <a href="/docs">Documentation</a> •
  <a href="/docs/api">API Reference</a> •
  <a href="CONTRIBUTING.md">Contributing</a>
</p>