# ZIP Code Weather Display

Simple web app to look up current weather by U.S. ZIP code using OpenWeatherMap.

## Features

- 5-digit U.S. ZIP search
- Current temp, feels-like, high/low
- Condition icon + description
- Humidity, wind, precipitation, sunrise, sunset
- Loading and error states
- Responsive layout

## Setup

1. Create a free API key at https://openweathermap.org/api.
2. In script.js, replace:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```

with your key.

## Run

- Open index.html directly, or
- Run a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Usage

1. Enter a 5-digit U.S. ZIP code.
2. Press Enter or click Search.
3. View results.

## Troubleshooting

- "Please set your OpenWeatherMap API key": API key was not replaced.
- "Invalid API key": key is incorrect or not activated yet.
- "ZIP code not found": ZIP is invalid or unsupported.
- "Network error": connection issue or API outage.
