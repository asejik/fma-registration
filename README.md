# Freedom Ministry Academy Registration Platform

A modern, full-stack registration platform for Freedom Ministry Academy built with React, TypeScript, Vite, and Firebase. This application enables students to register for the academy's cohorts, manage their profiles, and participate in Computer-Based Testing (CBT) assessments.

**Live Demo:** https://fma-registration.vercel.app

## Features

- **Student Registration** - Easy onboarding process for new students
- **User Authentication** - Secure Firebase authentication
- **CBT System** - Computer-Based Testing with real-time progress tracking
- **Payment Integration** - Paystack integration for seamless payments
- **Admin Dashboard** - Secure admin panel for managing student records and exam results
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Database** - Firestore for instant data synchronization

## Tech Stack

### Frontend
- **React 19** - UI framework with functional components and hooks
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling with hot module replacement
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Efficient form state management
- **Lucide React** - Beautiful, consistent icon library

### Backend & Services
- **Firebase** - Real-time database and authentication
- **Firestore** - Cloud document database
- **EmailJS** - Email service integration
- **Paystack** - Payment processing
- **Swiper** - Touch slider/carousel

### Development Tools
- **ESLint** - Code quality and linting
- **TypeScript ESLint** - Type-aware linting rules
- **Vite Rolldown** - Ultra-fast build tool

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project account
- Paystack account (for payment features)
- EmailJS account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asejik/fma-registration.git
   cd fma-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

## Project Structure

```
fma-registration/
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components for routes
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Firebase and API integrations
│   ├── utils/             # Utility functions
│   ├── context/           # React Context for global state
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── vercel.json            # Vercel deployment config
├── firestore.rules        # Firestore security rules
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Project dependencies
```

## Firestore Security Rules

The project implements comprehensive Firestore security rules protecting student data:

- **Students Collection** - Only admins can read/update student records; public registration allowed
- **CBT Results** - Students can view their own scores; admin can manage all results
- **CBT User Profiles** - Private to students and admins
- **CBT Progress** - Temporary exam progress tracking; secure per-student
- **Admin Functions** - Restricted to admin@fma.com

See `firestore.rules` for the complete security configuration.

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** and connect your repository to Vercel
2. **Configure environment variables** in Vercel project settings
3. **Deploy** - Vercel will automatically build and deploy on push to main branch

```bash
npm run build  # Test build locally first
```

The app uses Vercel's SPA rewrite configuration (`vercel.json`) to properly route all requests to `index.html`.

## Development Guidelines

This project follows strict development practices defined in `.cursorrules`:

- **Components** - Functional components with named exports (no default exports)
- **Styling** - Tailwind CSS v4 utility classes only; no `@apply` directives
- **State Management** - Local state preferred; Context API for global auth state
- **Performance** - React.lazy and Suspense for code splitting
- **Firebase** - Modular SDK imports only (v9+)
- **Security** - Environment variables for sensitive API keys (never hardcoded)

## Contributing

When contributing to this project:

1. Follow the code style defined in `.cursorrules`
2. Use TypeScript for all new files
3. Run `npm run lint` before committing
4. Ensure components use Tailwind CSS for styling
5. Keep components focused and modular with named exports

## Security & Privacy

- Student personal information (addresses, phone numbers) is protected by Firestore rules
- Only authenticated admins can access sensitive data
- Payment processing is handled securely through Paystack
- Environment variables must be configured for API credentials
- CBT results cannot be tampered with after submission

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private. All rights reserved.

## Support & Contact

For issues or questions about this project, please open an issue on GitHub.

---

**Built with ❤️ for Freedom Ministry Academy**
