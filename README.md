# RoomFlow: Modern Hotel Management System

RoomFlow is a comprehensive, full-stack Hotel Management System designed to streamline operations for administrators, staff, and guests. Built with a modern tech stack, it features real-time synchronization, an intuitive interface, and powerful management tools.

## Key Features

### Admin Dashboard (Executive Overview)
- **Real-Time Analytics**: Live overview of occupancy rates, revenue estimates, and room statuses powered by Socket.io.
- **Room Lifecycle Management**: Complete control over room allocation, checkout, and maintenance status updates.
- **Live Activity Feed**: Monitor real-time activities including new orders, service requests, and housekeeping updates.
- **CRM Integration**: Built-in Lead Management system to track incoming sales queries and group bookings.
- **System Settings**: Configurable platform-wide settings such as tax rates and CRM modules.

### Staff Dashboard (Operations)
- **Task Management System**: Real-time task reception for Housekeeping, Kitchen (Orders), and Maintenance.
- **Status Workflows**: Staff can automatically accept and update tasks to "Completed" to instantly reflect on the Admin Pulse.
- **Performance Tracking**: Staff UI includes personalized profiles and performance metric visualizations.

### Guest Experience
- **Digital Concierge**: Guests can log in using their Room ID to request room service, laundry, or maintenance.
- **In-Room Dining Cart**: Seamless cart experience for ordering food directly to the room.
- **Real-Time Statuses**: Guests receive live updates when their requests are marked as "In Progress" or "Completed" by staff.

## Technology Stack

**Frontend (Client)**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4, Framer Motion (for animations), Lucide React (Icons)
- **State & Routing**: React Router DOM v7
- **Real-Time**: Socket.io Client

**Backend (Server)**
- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **Real-Time**: Socket.io (WebSocket implementation)
- **Mock Mode**: The system gracefully falls back to an intelligent "Mock Mode" utilizing local data arrays if MongoDB is disconnected. This guarantees the demo/app will never experience downtime due to database connection limits.

## Architecture & Data Flow

1. **Authentication:** Distinct login portals exist for Admin/Staff (`/admin-login`) and Guests (`/login`).
2. **WebSockets (Socket.io):** Forms the backbone of the application. When a guest submits a Service Request, an event is emitted and broadcasted to the Staff Task Board and the Admin's Live Pulse feed. When Staff completes the task, the Guest UI is updated instantly.
3. **Database Schema:** 
   - `Room`: Tracks lifecycle states (Ready -> Occupied -> Cleaning -> Ready).
   - `Customer`: Unique Customer IDs associated with an active `Room`.
   - `Order` & `ServiceRequest`: Tied to Room Numbers to ensure accurate delivery.

## Running the Application Locally

1. **Server Setup:**
   ```bash
   cd server
   npm install
   npm run dev  # Starts the server on port 5001 with nodemon
   ```
   *Note: Ensure an active MongoDB Atlas URI is set in `server/.env` as `MONGODB_URI`.*

2. **Client Setup:**
   ```bash
   cd client
   npm install
   npm run dev  # Starts the Vite development server
   ```

## Deployment Notes

- **Backend:** Designed for Render (or any Node.js environment). Ensure `PORT` and `MONGODB_URI` environment variables are configured.
- **Frontend:** Optimized for Vercel. Contains a `vercel.json` file to manage Single-Page Application (SPA) routing to prevent `/route` refresh errors. Requires the `VITE_API_URL` environment variable to point to the live backend URL.

## Future Roadmaps

- Integrating a robust Payment Gateway (like Stripe or Razorpay) for direct UI checkout.
- Implementing an automated invoicing system connected to guest portfolios.
- Adding multi-property support for franchise management.
