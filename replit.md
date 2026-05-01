# Driver Connect - Driver Business Platform

## Project Overview
Driver Connect is a way to build your own rideshare or delivery business. Drivers can build their own personal customer base. Drivers can:
- Set their availability status (Available, On Break, Busy, Vacation)
- Manage their weekly schedule
- Share a personal profile link with passengers via SMS
- Keep track of their regular customers

Passengers who receive the link can:
- View the driver's current status with color-coded indicators
- See the driver's weekly schedule
- Contact the driver directly

## Technology Stack
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Custom CSS with modern glassmorphism design

## Project Structure
```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # Main application screens
│   │   └── styles/         # CSS stylesheets
│   └── index.html          # HTML template
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle database schema
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
└── drizzle.config.ts       # Drizzle ORM configuration
```

## Features

### Driver Features
1. **Status Control** - Set current availability with 4 status options:
   - 🟢 Available - Ready to take rides
   - 🟡 On Break - Taking a short break
   - 🔴 Busy - Currently unavailable
   - 🔵 Vacation - Away on vacation

2. **Schedule Management** - Set working hours for each day of the week

3. **Customer Management** - Keep track of regular passengers with notes

4. **Share Profile** - Copy link or send via SMS to passengers

### Customer Portal
- View driver's real-time status with animated indicators
- See weekly schedule with today highlighted
- One-tap call or text to driver
- No account required for customers

## API Endpoints

### Drivers
- `GET /api/driver/:id` - Get driver by ID
- `GET /api/driver/code/:code` - Get driver by profile code (for customer portal)
- `POST /api/driver` - Create new driver profile
- `PATCH /api/driver/:id/status` - Update driver status

### Schedules
- `GET /api/driver/:id/schedules` - Get driver's schedules
- `POST /api/driver/:id/schedules` - Create schedule entry
- `PATCH /api/schedule/:id` - Update schedule
- `DELETE /api/schedule/:id` - Delete schedule

### Customers
- `GET /api/driver/:id/customers` - Get driver's customers
- `POST /api/driver/:id/customers` - Add customer
- `DELETE /api/customer/:id` - Remove customer

## Database Schema

### drivers
- id, name, phone, email, profileCode, status, statusMessage, createdAt, updatedAt
- firstName, lastName, companyName, address, city, state, zipCode, photoUrl, bio
- facebook, instagram, linkedin, googleBusiness, twitter (social media links)
- baseFare, distanceRate, timeRate, surgePricing, bookingFee, tollsSurcharges (pricing)

### schedules
- id, driverId, dayOfWeek (0-6), startTime, endTime, isActive

### customers
- id, driverId, name, phone, notes, createdAt

## Running the Application
- **Development**: `npm run dev` - Starts Express server on port 5000
- **Build**: `npm run build` - Builds React frontend
- **Database**: `npm run db:push` - Push schema changes to database

## Future Enhancements
- Twilio integration for automated SMS link sending
- Push notifications when driver status changes
- Driver ratings and reviews
- Ride history exports

## Recent Changes
- 2025-12-27: Added navigation and ride queue system
  - Ride queue ordered by scheduled time with "Up Next" indicator
  - GPS navigation buttons to open Google Maps for pickup/dropoff
  - Late arrival detection (10 min warning) with customer contact prompt
  - Customer tracking shows live driver location on map
  - Real-time queue management with auto-refresh

- 2025-12-27: Added driver pricing configuration
  - Base fare, distance rate, time rate settings
  - Surge pricing multiplier for high-demand periods
  - Booking fee and tolls/surcharges options
  - Sample fare calculator with breakdown
  - Descriptions for each pricing option

- 2025-12-27: Added comprehensive driver profile
  - Photo upload with preview
  - Personal info (first name, last name, email)
  - Business info (company name)
  - Address fields (street, city, state, zip)
  - Service areas management
  - Bio/description
  - Social media links

- 2025-11-30: Added complete booking and payment system
  - Ride booking with date/time selection from driver's schedule
  - GPS tracking for customers to see driver location during pickup
  - Stripe integration for card payments
  - Cash payment option
  - Tipping screen with preset options (10%, 15%, 20%) and custom amounts
  - Booking management for drivers (pending, confirm, decline, complete)
  - Location sharing toggle for drivers

- 2025-11-30: Complete rebuild as Driver Connect platform
  - Created new Express + React architecture
  - Implemented driver dashboard with status, schedule, and customer management
  - Built customer portal with real-time status display
  - Added PostgreSQL database with Drizzle ORM
  - Designed modern dark theme UI
