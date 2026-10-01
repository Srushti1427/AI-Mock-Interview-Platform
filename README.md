# InterviewAI - AI Mock Interview & Placement Platform

An advanced, AI-powered mock interview and placement preparation platform designed to help students and job seekers practice technical interviews, quantitative aptitude tests, and behavioral evaluations with real-time feedback.

---

## 🚀 Main Features

- **Role-Specific AI Mock Interviews**: Dynamically generates targeted technical and behavioral interview questions based on job description, experience level, and technology stack.
- **Structured Answer Evaluation**: Evaluates candidate answers using a 1–10 numerical scoring rubric, identifying key strengths, areas for improvement, and detailed model answers.
- **Adaptive Quantitative Aptitude Tests**: Practice mathematical reasoning, logic, and analytical problem-solving modules.
- **Common Question Library**: Domain-categorized technical question banks for self-study and rapid interview revision.
- **AI Career Assistant Chatbot**: Interactive guidance for interview preparation strategies, resume advice, and technical explanations.
- **Performance & Activity Dashboard**: Centralized dashboard tracking completed sessions, aptitude scores, historical interview performance, and active study streaks.
- **Speech-to-Text Audio Processing**: Transcribes voice responses using Groq Whisper API (`whisper-large-v3`).
- **Webcam & Audio Review**: Optional webcam stream monitoring and audio playback review.
- **Secure Authentication**: User sign-in, user profiles, and session management powered by Clerk.

---

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS, Shadcn UI components
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database**: MongoDB / MongoDB Atlas (`utils/db.js`)
- **AI Engine (Primary)**: Groq SDK (`qwen/qwen3.8-27b`, `whisper-large-v3`)
- **AI Engine (Fallback)**: Google Gemini AI (`@google/generative-ai`)
- **Webcam / Computer Vision**: TensorFlow.js (`@tensorflow/tfjs`, `@tensorflow-models/blazeface`)
- **Deployment**: Vercel

---

## 📁 Project Structure

```text
Ai-mock-Interview/
├── app/
│   ├── (auth)/                  # Clerk Sign-in & Sign-up pages
│   ├── _components/             # Shared landing components (e.g., Contact form)
│   ├── admin/                   # Admin panel routes & analytics
│   ├── api/                     # Next.js API route handlers
│   ├── dashboard/               # Main application dashboard
│   │   ├── aptitude/            # Aptitude testing module
│   │   ├── chatbot/             # AI Career Chatbot
│   │   ├── contact/             # Support & Contact page
│   │   ├── interview/           # Mock interview session & feedback viewer
│   │   ├── performance/         # Detailed activity & analytics dashboard
│   │   └── question/            # Domain question banks
│   ├── globals.css              # Global styles & design system tokens
│   ├── layout.js                # Root layout & ClerkProvider configuration
│   └── page.js                  # Landing Page UI
├── components/                  # Reusable UI components & theme providers
├── lib/                         # MongoDB & utility helpers
├── public/                      # Static assets & brand logos
└── utils/                       # Shared AI interfaces, DB connection & admin helpers
```

---

## 🔐 Environment Setup

Create a `.env.local` file in the root directory and add the following required environment variables:

```env
# AI Providers
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Database
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=ai-mock-interview

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Admin Configuration
ADMIN_EMAIL=your_admin_email_here
```

> ⚠️ **Security Notice**: Never commit `.env` or `.env.local` files containing actual API keys or secrets to public repositories.

---

## 💻 Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Ai-mock-Interview.git
   cd Ai-mock-Interview
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Production Build & Deployment

To create an optimized production build:

```bash
npm run build
npm start
```

### Deploying to Vercel

1. Push your code to GitHub.
2. Import the project into your Vercel Dashboard.
3. Configure the environment variables (`GROQ_API_KEY`, `GOOGLE_API_KEY`, `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAIL`) in the Vercel Project Settings.
4. Deploy!

---

## 📜 Author & Acknowledgments

- **Crafted with Passion by**: Srushti Kisan Shivanwar
- **System**: Placement & Interview Preparation System (`InterviewAI`)

