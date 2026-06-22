# 🌍✈️ WanderSwipe

**Swipe. Discover. Travel.**

WanderSwipe is a modern travel discovery platform that transforms the way people explore destinations. Inspired by the intuitive swipe-based experience of modern apps, WanderSwipe helps users discover their next adventure by simply swiping through personalized travel recommendations.

Instead of spending hours browsing blogs, videos, and travel websites, users can quickly explore destinations tailored to their interests, budget, and travel preferences. Whether you're looking for a peaceful beach getaway 🏖️, an exciting mountain trek 🏔️, or a vibrant city escape 🌆, WanderSwipe helps you find the perfect destination effortlessly.

---

## 🚀 Features

### 🌍 Swipe-Based Travel Discovery

Explore destinations through an engaging swipe interface designed to make travel planning simple and fun.

### 🎯 Personalized Recommendations

Receive destination suggestions based on your interests, travel style, and preferences.

### 📌 Save Favorite Destinations

Bookmark destinations you love and revisit them later when planning your trip.

### 🔐 Secure Authentication

Email-based OTP verification ensures a smooth and secure login/signup experience.

### ⚡ Fast & Responsive UI

Built with modern web technologies to provide a seamless user experience across devices.

### 🎨 Modern User Experience

Clean and intuitive interface designed for effortless navigation and travel exploration.

---

## 🛠️ Tech Stack

### Frontend

* ⚛️ Next.js
* ⚛️ React
* 🔷 TypeScript
* 🎨 Tailwind CSS

### Backend & Database

* 🗄️ Supabase (PostgreSQL)

### Authentication

* 🔐 Supabase Auth
* 📧 Email OTP Verification

### Additional Services

* 🔥 Firebase Firestore

### Deployment & Tools

* ▲ Vercel
* 🐙 Git & GitHub
* 💻 VS Code
* 🤖 Lovable AI

---

## 📂 Project Structure

```bash
WanderSwipe/
├── app/
│   ├── auth/
│   ├── components/
│   ├── pages/
│   └── layout.tsx
├── public/
├── lib/
│   ├── supabaseClient.ts
│   └── firebase.ts
├── styles/
├── .env.local
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/WanderSwipe.git
cd WanderSwipe
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 🔒 Authentication Flow

1. User enters email address.
2. OTP is generated and sent via email.
3. User enters OTP.
4. OTP is verified using Supabase Authentication.
5. Session is created upon successful verification.

---

## 🎯 Problem Statement

Travel planning often requires users to browse multiple websites and compare endless options before deciding on a destination. This process can be overwhelming, time-consuming, and frustrating.

WanderSwipe addresses this problem by introducing a swipe-based recommendation system that simplifies destination discovery and helps users quickly find travel options that match their interests.

---

## 💡 Future Enhancements

* 🤖 AI-powered destination recommendations
* 🗺️ Interactive maps integration
* 🏨 Hotel and accommodation recommendations
* ✈️ Flight search integration
* 🌤️ Weather forecasts
* 📅 Travel itinerary generation
* 👥 Social sharing features
* ❤️ Smart recommendation engine

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📜 License

This project is developed for educational, learning, and hackathon purposes.

---

## 👨‍💻 Team WanderSwipe

Built with ❤️ to make travel discovery fun, engaging, and effortless.
