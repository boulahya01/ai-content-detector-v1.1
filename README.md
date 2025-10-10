# 🔍 AI Content Detector v1.1.0

An advanced web application that helps you detect AI-generated content with high accuracy and real-time analysis. Features batch processing, comprehensive monitoring, and mu### Usage

1. **Single File Analysis**
   - Visit the homepage
   - Enter text or upload a file (.txt, .docx, .pdf, .rtf)
   - Get instant AI detection results with confidence scoring
   - View detailed language analysis

2. **Batch Processing**
   - Upload multiple files (up to 10)
   - Monitor real-time processing progress
   - View batch analysis results
   - Download consolidated reports

3. **System Monitoring**
   - Access `/health` endpoint for system status
   - View performance metrics at `/metrics`
   - Monitor resource usage and system health
   - Track error rates and response times

4. **Premium Features** (requires login)
   - Save analysis history
   - Access advanced detection features
   - Process larger files (up to 200,000 characters)
   - Manage subscription plansdocument support.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-FF1C1C?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=darkgreen)](https://www.python.org/)

##  Overview

The AI Content Detector is a powerful web application that helps users identify AI-generated content. Key points:

1. **Public Access**: All core services are available to anonymous users
2. **Instant Analysis**: Direct content analysis from the landing page
3. **Optional Login**: Required only for premium features (history, subscriptions)

## Features

### Core Features
- Real-time AI content detection
- Batch processing support (up to 10 files)
- Support for multiple file formats (.txt, .docx, .pdf, .rtf)
- Interactive confidence scoring
- User authentication and authorization
- Usage tracking and subscription management
- Responsive and modern UI with TailwindCSS

### Technical Features
- Comprehensive monitoring system
  - Real-time performance metrics
  - Health check endpoints
  - Error tracking and alerts
  - Resource usage monitoring
- Advanced file processing
  - Memory-efficient batch processing
  - Metadata extraction
  - Content sanitization
  - File type validation
- Robust error handling
  - Detailed error tracking
  - Structured logging
  - Request ID tracking
  - Alert notifications
- Performance optimization
  - Async file processing
  - Concurrent batch operations
  - Resource usage monitoring
  - Rate limiting

##  Tech Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS
- **Vite**: Build tool and dev server

### Backend
- **FastAPI**: High-performance API framework
- **Python 3.10+**: Core programming language
- **pdfplumber**: PDF text extraction
- **python-docx**: DOCX file processing
- **langdetect**: Language detection
- **tenacity**: Retry mechanisms
- **aiofiles**: Async file operations
- **prometheus-client**: Metrics collection
- **python-magic**: File type detection

##  Project Structure

### Root Directory
```
📂 ai-content-detector/
 ├── 📄 .gitignore              # Git ignore rules
 ├── 📄 README.md               # Project documentation
 ├── 📄 .env.example            # Environment variables template
 ├── 📄 docker-compose.yml      # Docker services configuration
 ├── 📂 backend/                # Backend application
 └── 📂 frontend/               # Frontend application
```

### Backend (`/backend`)
```
📂 backend/
 ├── 📂 app/
 │   ├── 📄 main.py              # FastAPI application entry point
 │   ├── 📂 api/                 # API endpoints and route handlers
 │   │   └── 📄 analyze.py       # Content analysis endpoints
 │   ├── � models/              # Application models
 │   │   └── 📄 analyzer.py      # AI detection model
 │   └── 📂 utils/               # Utility modules
 │       ├── 📄 batch_processor.py     # Batch file processing
 │       ├── 📄 document_processor.py  # Document handling
 │       ├── 📄 exceptions.py          # Custom exceptions
 │       ├── 📄 language_detector.py   # Language detection
 │       ├── 📄 logging_config.py      # Logging setup
 │       ├── � monitoring.py          # System monitoring
 │       ├── 📄 rate_limiter.py        # Rate limiting
 │       └── 📄 validation.py          # Input validation
 ├── 📂 logs/                    # Application logs
 │   ├── 📄 debug.log           # Debug level logs
 │   ├── 📄 error.log          # Error level logs
 │   └── 📄 info.log           # Info level logs
 ├── 📂 metrics/                 # Monitoring metrics
 ├── 📂 tests/                   # Test suite
 │   ├── 📄 test_analyzer.py     # Analyzer tests
 │   ├── 📄 test_document_processor.py  # Document processing tests
 │   ├── 📄 test_monitoring.py   # Monitoring tests
 │   └── 📄 test_validation.py   # Validation tests
 └── 📄 requirements.txt         # Python dependencies
```

### Frontend (`/frontend`)
```
📂 frontend/
 ├── 📄 index.html              # Entry HTML file
 ├── 📄 package.json            # NPM dependencies and scripts
 ├── 📄 vite.config.ts          # Vite configuration
 ├── 📄 tsconfig.json           # TypeScript configuration
 ├── 📂 src/
 │   ├── 📄 main.tsx            # Application entry point
 │   ├── 📄 App.tsx             # Root component
 │   ├── 📂 api/                # API integration
 │   │   ├── 📄 analysis.ts     # Analysis service
 │   │   ├── 📄 auth.ts         # Auth service
 │   │   └── 📄 subscription.ts # Subscription service
 │   ├── 📂 components/         # Reusable components
 │   │   ├── 📂 features/       # Feature-specific components
 │   │   │   ├── 📂 analysis/   # Analysis components
 │   │   │   │   ├── 📄 AnalysisForm.tsx
 │   │   │   │   ├── 📄 AnalysisResults.tsx
 │   │   │   │   └── 📄 ConfidenceIndicator.tsx
 │   │   │   └── 📂 auth/       # Authentication components
 │   │   └── 📂 ui/             # UI components
 │   │       ├── 📄 Button.tsx
 │   │       ├── 📄 Card.tsx
 │   │       └── 📄 Input.tsx
 │   ├── 📂 context/            # React context providers
 │   │   ├── 📄 AuthContext.tsx
 │   │   └── 📄 AnalysisContext.tsx
 │   ├── 📂 hooks/              # Custom React hooks
 │   │   ├── 📄 useAuth.ts
 │   │   └── 📄 useAnalyzer.ts
 │   ├── 📂 pages/              # Route components
 │   │   ├── 📄 HomePage.tsx
 │   │   ├── 📄 AnalyzePage.tsx
 │   │   └── 📄 DashboardPage.tsx
 │   └── 📂 utils/              # Utility functions
 │       ├── 📄 api.ts          # API helpers
 │       └── 📄 validation.ts   # Form validation
 └── 📂 public/                 # Static assets
     ├── 📂 images/
     └── 📄 favicon.ico
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
git clone https://github.com/yourusername/ai-content-detector.git
cd ai-content-detector
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure Backend
   - Copy `.env.example` to `.env`
   - Set your environment variables
   - Configure logging levels in `utils/logging_config.py`
   - Set rate limits in `utils/rate_limiter.py`

4. Frontend Setup
```bash
cd frontend
npm install  # or yarn install
```

### Running the Application

1. Start the Backend
```bash
cd backend
# Start with monitoring and logging configuration
uvicorn app.main:app --reload --port 8000 --log-config utils/logging_config.py
```

2. Access Monitoring
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

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent API framework
- [React](https://reactjs.org/) for the powerful UI library
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework