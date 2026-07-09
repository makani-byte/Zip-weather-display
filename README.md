# 🌤️ ZIP Code Weather Display

A clean, modern web application that allows users to search for current weather conditions by U.S. ZIP code.

## ✨ Features

- **Search by ZIP Code**: Enter any valid U.S. ZIP code to get instant weather data
- **Comprehensive Weather Information**:
  - City and state location
  - Current temperature
  - "Feels Like" temperature
  - Today's high and low temperatures
  - Current weather conditions with dynamic icons
  - Humidity percentage
  - Wind speed and direction
  - Chance of precipitation
  - Sunrise and sunset times
  - Last updated timestamp
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Mobile-Friendly**: Fully responsive layout that works on all devices
- **Error Handling**: Clear error messages for invalid ZIP codes
- **Loading Animation**: Visual feedback while fetching weather data

## 🚀 Setup Instructions

### 1. Get a Free API Key

This application uses the OpenWeatherMap API. You'll need a free API key:

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. After logging in, go to "API Keys" in your account dashboard
4. Copy your API key (it may take a few minutes to activate)

### 2. Configure the Application

1. Open `script.js` in a text editor
2. Find this line near the top:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   const API_KEY = 'your_actual_api_key_12345';
   ```
4. Save the file

### 3. Run the Application

Since this is a static web application, you can run it in several ways:

#### Option A: Open Directly in Browser
1. Simply double-click `index.html`
2. It will open in your default browser

#### Option B: Use Live Server (Recommended for Development)
1. If using VS Code, install the "Live Server" extension
2. Right-click on `index.html` and select "Open with Live Server"
3. The application will open in your browser with auto-reload on changes

#### Option C: Use Python's Built-in Server
1. Open a terminal in the project directory
2. Run:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and go to `http://localhost:8000`

## 📖 How to Use

1. Enter a valid 5-digit U.S. ZIP code (e.g., 10001, 90210, 60601)
2. Click "Search" or press Enter
3. View the current weather conditions and forecast
4. Enter a new ZIP code to update the display

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with gradients, animations, and flexbox/grid layouts
- **JavaScript (ES6+)**: Async/await API calls, DOM manipulation
- **OpenWeatherMap API**: Real-time weather data

## 📱 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

Feel free to customize the appearance:
- **Colors**: Modify the gradient colors in `style.css`
- **Layout**: Adjust the grid and flexbox layouts
- **Icons**: The weather icons are provided by OpenWeatherMap

## 📝 API Rate Limits

The free OpenWeatherMap API tier includes:
- 60 calls per minute
- 1,000,000 calls per month

This is more than sufficient for personal use.

## ⚠️ Troubleshooting

**"Please set your OpenWeatherMap API key"**
- Make sure you've replaced `YOUR_API_KEY_HERE` in `script.js`

**"Invalid API key"**
- Verify your API key is correct
- New API keys can take up to 2 hours to activate

**"ZIP code not found"**
- Ensure you're entering a valid U.S. ZIP code
- The API only supports U.S. ZIP codes

**"Network error"**
- Check your internet connection
- Verify the API is not experiencing downtime

## 📄 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to fork this project and make improvements!
