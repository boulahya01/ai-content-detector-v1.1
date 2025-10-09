#  AI Content Detector

An advanced web application that helps you detect AI-generated content with high accuracy and real-time analysis.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

##  Overview

The AI Content Detector is a powerful web application that helps users identify AI-generated content. Key points:

1. **Public Access**: All core services are available to anonymous users
2. **Instant Analysis**: Direct content analysis from the landing page
3. **Optional Login**: Required only for premium features (history, subscriptions)

##  Features

- Real-time AI content detection
- Support for multiple file formats (.txt, .docx)
- Interactive confidence scoring
- User authentication and authorization
- Usage tracking and subscription management
- Responsive and modern UI with TailwindCSS
- RESTful API with FastAPI
- Comprehensive error handling

##  Tech Stack

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS
- **Vite**: Build tool and dev server

### Backend
- **FastAPI**: High-performance API framework
- **Python**: Core programming language
- **SQLAlchemy**: Database ORM
- **JWT**: Authentication

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
 │   │   ├── 📄 analyze.py       # Content analysis endpoints
 │   │   ├── 📄 auth.py          # Authentication routes
 │   │   └── 📄 subscription.py   # Subscription management
 │   ├── 📂 models/              # Database models and schemas
 │   │   ├── 📄 user.py          # User model
 │   │   ├── 📄 analysis.py      # Analysis results model
 │   │   └── 📄 subscription.py   # Subscription model
 │   └── 📂 utils/               # Utility functions and helpers
 │       ├── 📄 auth.py          # Authentication utilities
 │       └── 📄 analysis.py      # Analysis helpers
 ├── 📂 tests/                   # Test suite
 │   ├── 📄 test_api.py          # API endpoint tests
 │   └── 📄 test_models.py       # Model unit tests
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

3. Frontend Setup
```bash
cd frontend
npm install  # or yarn install
```

### Running the Application

1. Start the Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Start the Frontend
```bash
cd frontend
npm run dev  # or yarn dev
```

The application will be available at `http://localhost:5173`

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