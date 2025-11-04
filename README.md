# IP Subnet Game

An educational Svelte application where users practice identifying IP addresses that belong to specified networks and subnet masks.

## Features

- **Interactive Gameplay**: Users input IP addresses that fit a specified network and subnet mask
- **Dual Format Display**: Shows IP addresses and subnet masks in both decimal and binary formats
- **Input Validation**: Comprehensive validation with clear error messages
- **Score Tracking**: Tracks score, correct answers, and total attempts
- **JSON Responses**: All game interactions structured as JSON objects
- **Performance Breakdown**: Detailed final results with all submission history

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## How to Play

1. The game displays a network address and subnet mask in both decimal and binary formats
2. Enter an IP address that belongs to the specified network
3. Submit your answer to see validation results
4. Correct answers increment your score
5. The game ends after 5 correct answers
6. View your final results and performance breakdown

## Game Rules

- Each correct answer increases your score by 1
- The game tracks both correct answers and total attempts
- Input validation ensures proper IP address format (four octets, 0-255 each)
- Game completes after achieving 5 correct answers

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push your code** to the `main` branch - the workflow will automatically:
   - Build your Svelte app
   - Deploy it to GitHub Pages
   - Set the correct base path based on your repository name

3. **Access your site**:
   - If your repo is `username.github.io`, the site will be at `https://username.github.io`
   - Otherwise, it will be at `https://username.github.io/repo-name`

The workflow automatically determines the correct base path, so no manual configuration is needed!

### Manual Deployment

You can also manually trigger the deployment workflow:
- Go to Actions tab in your repository
- Select "Deploy to GitHub Pages" workflow
- Click "Run workflow"

