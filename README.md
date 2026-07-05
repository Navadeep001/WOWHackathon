# 🚀 LegoLink

LegoLink is an AI-powered hackathon team formation platform that helps developers, designers, and innovators discover hackathons, find compatible teammates, and build winning teams effortlessly.

---

## 🌟 Features

### 🔐 Authentication
- Sign up and log in using Email or Google authentication
- Secure user sessions
- Easy onboarding process

### 👤 User Profile Setup
- Select skills and technologies
- Set experience level
- Add availability and location
- Connect GitHub and portfolio links
- Create a personalized developer profile

### 🏆 Hackathon Dashboard
- Browse upcoming hackathons
- View hackathon details and deadlines
- Filter hackathons by category and date
- Save interesting events

### 🤝 Team Matching
- AI-powered teammate recommendations
- Match users based on:
  - Skills
  - Tech stack preferences
  - Experience level
  - Availability
  - Interests

### 💬 Collaboration Features
- Send team requests
- Accept or reject invitations
- View team members
- Communicate with potential teammates

### 📱 Responsive Design
- Mobile-friendly interface
- Modern and clean UI
- Optimized for all screen sizes

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** – React framework for building the application
- **TypeScript** – Type-safe JavaScript development
- **Tailwind CSS** – Utility-first CSS framework for styling

### Backend
- **Supabase**
  - Authentication
  - PostgreSQL Database
  - Real-time capabilities
  - API services

### AI Integration
- Gemini API / OpenAI API for intelligent teammate matching and recommendations.

---

## 📂 Project Structure

```bash
legolink/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── dashboard/
│   ├── profile/
│   ├── hackathons/
│   └── teams/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
│
├── lib/
│   ├── supabaseClient.ts
│   └── utils.ts
│
├── public/
├── types/
├── hooks/
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/legolink.git
cd legolink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the development server

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

## 🎯 How It Works

1. Create an account.
2. Complete your profile.
3. Browse upcoming hackathons.
4. Get AI-based teammate recommendations.
5. Send requests and form teams.
6. Collaborate and participate in hackathons.

---

## 🔮 Future Enhancements

- Real-time chat system
- Team video meetings
- AI resume analysis
- GitHub contribution-based matching
- Skill verification badges
- Personalized hackathon recommendations
- Team progress tracking
- Notifications and reminders

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push to your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Inspiration

Building the right team is often the hardest part of participating in a hackathon. LegoLink aims to make team formation simple, intelligent, and accessible so that innovators can focus on building amazing projects instead of searching for teammates.

---

### Built with ❤️ for the Hackathon Community
