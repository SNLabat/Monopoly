# 🎩 Mr. Big Penta's Rolls 2 Riches

A comprehensive Monopoly tournament tracking and statistics system built with React.

## Features

- **Live Game Tracking**: Real-time game state monitoring with player positions, money, and properties
- **Tournament Management**: Add players, track wins/losses, and maintain leaderboards
- **Event Logging**: Comprehensive game event tracking with timestamps
- **Statistics Dashboard**: Detailed analytics and performance metrics
- **Data Export**: Export player data, game states, and reports in CSV, JSON, and HTML formats
- **Modern UI**: Beautiful, responsive interface with dark theme and smooth animations

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Setting Up a Tournament

1. **Add Players**: Go to the "Players" tab and add tournament participants with their preferred tokens
2. **Start a Game**: Navigate to "Game Tracker" and add players to the current game
3. **Track Progress**: Use the live tracking features to monitor player positions, money, and events
4. **Export Data**: Use the dashboard to export tournament data and generate reports

### Game Tracking Features

- **Player Management**: Track cash, net worth, properties, and positions
- **Dice Roll Recording**: Log dice rolls and track doubles
- **Event Logging**: Record purchases, rent payments, jail time, and custom events
- **Turn Management**: Navigate through player turns with visual indicators
- **Quick Actions**: Fast money transactions and position updates

### Data Export Options

- **CSV**: Player statistics, game events, and current game state
- **JSON**: Complete tournament data for backup and analysis
- **HTML**: Professional tournament reports with styling

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful, customizable icons
- **Modern JavaScript**: ES6+ features and best practices

## Project Structure

```
src/
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── index.css        # Global styles with Tailwind imports

public/
└── index.html       # HTML template

config files:
├── package.json     # Dependencies and scripts
├── vite.config.js   # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the repository or contact the development team.
