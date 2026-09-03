# ZIP Code Weather Display

Simple web app to look up current weather by U.S. ZIP code using Open-Meteo.

## Features

- 5-digit U.S. ZIP search
- Current temp, feels-like, high/low
- Condition icon + description
- Humidity, wind, precipitation, sunrise, sunset
- Loading and error states
- Responsive layout
- No API key required

## Setup

No API key is required. The app uses the free Open-Meteo API directly in the browser.

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

- "ZIP code not found": ZIP is invalid or unsupported.
- "Network error": connection issue or API outage.
- Weather not loading: confirm you are using a local server or a browser that allows fetch requests.
