# Nordride - Sustainable Ride Sharing Platform

## 🚗 Overview

Nordride is a free, community-driven ride-sharing platform designed for sustainable travel across the Nordic countries. Starting in Sweden, the platform connects drivers with empty seats to riders heading in the same direction, promoting cost-sharing and reducing carbon emissions.

## 🎯 Key Features

- **No platform fees** - Completely free to use
- **Fair cost sharing** - Costs split equally among all participants
- **Smart matching** - Find rides within 50km of your route
- **Trust-based community** - Text reviews and verified profiles
- **Real-time messaging** - Chat with drivers and riders
- **Mobile responsive** - Works on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Maps**: Leaflet + MapTiler
- **Geocoding**: LocationIQ
- **Routing**: OpenRouteService
- **Email**: Resend
- **Hosting**: Vercel

## 📦 Installation

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your API keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up Supabase:
   ```bash
   npx supabase init
   npx supabase start
   npx supabase db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Required API Keys

- **Supabase**: Create a project at [supabase.com](https://supabase.com)
- **LocationIQ**: Get free API key at [locationiq.com](https://locationiq.com)
- **OpenRouteService**: Get free API key at [openrouteservice.org](https://openrouteservice.org)
- **MapTiler**: Get free API key at [maptiler.com](https://maptiler.com)
- **Resend**: Get API key at [resend.com](https://resend.com)

## 📱 Core User Flows

### For Drivers
1. Sign up and verify email
2. Add vehicle details
3. Create a ride with origin, destination, and preferences
4. Review and approve booking requests
5. Chat with approved riders
6. Complete the trip

### For Riders
1. Search for rides by entering start and destination
2. View available rides with driver profiles
3. Send booking request with message
4. Once approved, chat with driver and arrange payment
5. Leave a review after the trip

## 🗂 Project Structure

```
nordride/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and configurations
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── public/          # Static assets
├── styles/          # Global styles
└── supabase/        # Database migrations
```

## 🚀 Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for sustainable travel in the Nordics
