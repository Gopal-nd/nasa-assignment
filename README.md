# Cosmic Event Tracker 🌌

A beautiful and feature-rich web application for monitoring Near-Earth Objects (NEOs) and cosmic events using NASA's Open APIs. Built with React, TypeScript, and modern web technologies.

## ✨ Features

- **Real-time NEO Monitoring**: Track Near-Earth Objects using NASA's comprehensive database
- **Advanced Filtering & Sorting**: Filter by hazardous status, sort by various criteria
- **Asteroid Comparison**: Select and compare multiple asteroids side-by-side
- **Beautiful UI/UX**: Modern, responsive design using ShadCN components
- **User Authentication**: Secure login/signup with Supabase
- **Interactive Charts**: Visual comparison of asteroid parameters
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS + ShadCN UI
- **Authentication**: Supabase Auth
- **State Management**: React Hooks + Zustand
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- NASA API key (free from [api.nasa.gov](https://api.nasa.gov/))
- Supabase account (free tier available)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cosmic-event-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # NASA API Configuration
   VITE_NASA_API_KEY=your_nasa_api_key_here
   
   # Supabase Configuration (if not already configured)
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Get NASA API Key**
   - Visit [https://api.nasa.gov/](https://api.nasa.gov/)
   - Sign up for a free account
   - Generate an API key
   - Add it to your `.env` file

5. **Configure Supabase** (if not already done)
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Email authentication
   - Copy your project URL and anon key to `.env`

## 🚀 Running the Application

1. **Development Mode**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. **Build for Production**
   ```bash
   pnpm build
   # or
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   pnpm serve
   # or
   npm run serve
   ```

## 🌟 Key Features Explained

### Dashboard
- **Real-time Data**: Fetches NEO data for the current week
- **Smart Filtering**: Toggle to show only hazardous asteroids
- **Advanced Sorting**: Sort by date, name, distance, velocity, or diameter
- **Selection System**: Checkbox selection for comparison
- **Load More**: Incrementally load more asteroid data

### Comparison Tool
- **Multi-asteroid Analysis**: Compare up to 10 selected asteroids
- **Visual Rankings**: See asteroids ranked by distance, velocity, and diameter
- **Detailed Metrics**: Comprehensive comparison tables
- **Interactive Cards**: Click for detailed information

### Authentication
- **Secure Login/Signup**: Email-based authentication
- **Protected Routes**: Dashboard and comparison features require login
- **Session Management**: Automatic session handling

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔧 Customization

### Adding New Filters
1. Add new filter state in the dashboard component
2. Update the `filteredAndSortedNeos` function
3. Add UI controls for the new filter

### Adding New Sort Options
1. Add new case in the switch statement
2. Implement the sorting logic
3. Add the option to the select dropdown

### Styling Changes
- Modify Tailwind classes in components
- Update ShadCN component variants
- Customize the color scheme in `tailwind.config.js`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
1. Run `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Ensure environment variables are set

## 📊 API Usage

The application uses NASA's Near Earth Object Web Service (NeoWs):
- **Endpoint**: `https://api.nasa.gov/neo/rest/v1/feed`
- **Rate Limits**: 1000 requests per hour (free tier)
- **Data**: Real-time NEO information including trajectories, velocities, and hazard assessments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **NASA**: For providing the comprehensive NEO database
- **Supabase**: For authentication and backend services
- **ShadCN**: For the beautiful UI components
- **TanStack**: For the excellent routing solution

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/cosmic-event-tracker/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Developed with ❤️ by @GopalPatel**

*Track the cosmos, stay informed, explore the universe!* 🚀✨
