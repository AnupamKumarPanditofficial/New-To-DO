# Task-Toggler: The AI-Powered To-Do List

Live link -> https://new-to-do-eight.vercel.app/

Task-Toggler is a modern, full-stack to-do list application designed to enhance productivity through intelligent, AI-driven features. It leverages facial recognition for secure login and offers smart task suggestions and reminders to keep you on track.


## ✨ Key Features

- **Facial Recognition Login**: Log in securely and instantly using your face. No need to remember passwords.
- **AI Task Suggestions**: Get personalized task suggestions based on your current mood (e.g., "feeling tired," "get productive") or long-term goals like exam preparation.
- **Intelligent Reminders**: Receive smart, timely reminders for your upcoming tasks, powered by an AI that understands your schedule.
- **Real-time Collaboration**: Create or join groups with friends using a simple passkey. Track each other's progress on a shared dashboard.
- **Productivity Analytics**: Visualize your daily and weekly progress with clean, straightforward charts.
- **Streak Tracker**: Stay motivated by building a daily usage streak. The app tracks your active days and missed days to keep you engaged.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI Toolkit**: [Genkit](https://firebase.google.com/docs/genkit) (using Google's Gemini models)
- **Database**: [Firestore](https://firebase.google.com/docs/firestore) for real-time collaboration features.
- **UI Components**: Built with [ShadCN UI](https://ui.shadcn.com/).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/).
- **Deployment**: Ready for [Vercel](https://vercel.com/).

## 🛠️ Getting Started

To run this project locally, you'll need to set up a few environment variables.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- `npm` or `yarn`

### 2. Setup Environment Variables

Create a file named `.env` in the root of your project and add the following credentials.

```env
# Firebase Credentials (get from your Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Google AI (Gemini) API Key (get from Google AI Studio)
GEMINI_API_KEY=
```

- **Firebase**: Go to your [Firebase Console](https://console.firebase.google.com/), create a project, and find your web app's configuration in the project settings.
- **Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application should now be running on [http://localhost:9002](http://localhost:9002).

## ☁️ Deployment

This application is configured for easy deployment on [Vercel](https://vercel.com/).

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the environment variables listed above to your Vercel project settings.
4. Click "Deploy"!

