# Tic Tac Toe Plus

A modern, polished, and feature-rich implementation of the classic Tic Tac Toe game. Built with React, Vite, and TailwindCSS, this application offers a premium user experience with smooth animations, glassmorphism design, and multiple game modes.

<p align="center">
  <img src="public/home.png" width="150" alt="Tic Tac Toe Plus Logo" />
</p>

## Features

- **Modern UI/UX**: Sleek glassmorphism effects, animated backgrounds, and smooth transitions.
- **Multiple Game Modes**:
  - **Local 2-Player**: Play with a friend on the same device.
  - **Play vs Bot**: Challenge an AI with 3 difficulty levels (Easy, Medium, Hard).
  - **Online Multiplayer**: Real-time gameplay with remote opponents using Socket.io.
- **Dark/Light Mode**: Fully responsive theme toggling.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Interactive Feedback**: Confetti celebrations for wins, toast notifications, and dynamic game status updates.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS, Lucide React (Icons), Radix UI (Primitives)
- **Backend**: Node.js, Express, Socket.io (for multiplayer features)
- **State Management**: Custom React Hooks

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tic-tac-toe-plus.git
   cd tic-tac-toe-plus
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies** (Required for Online Multiplayer)
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the App

1. **Start the Backend Server**
   ```bash
   npm run server
   ```
   *The server will start on port 3005.*

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:8080` (or the port shown in your terminal).*

## Deployment

### GitHub Pages (Frontend Only)
This project is configured for deployment to GitHub Pages.
> **Note**: The **Online Multiplayer** feature requires the Node.js server to be running. If hosted solely on GitHub Pages, only "Local 2-Player" and "Play vs Bot" modes will function correctly unless the backend is hosted separately (e.g., on Render, Railway, or Heroku) and the `SOCKET_URL` is updated.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve the game.

## License

This project is open source and available under the [MIT License](LICENSE).
