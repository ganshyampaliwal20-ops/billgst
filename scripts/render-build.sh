#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Install Playwright/Puppeteer dependencies (if needed)
# On Render, the simplest way to run Puppeteer in a Web Service is to use 
# a Build Script that ensures the cache is clean and everything is ready.
# Usually, Render installs the necessary libs if Puppeteer is in package.json, 
# but we can add manual triggers here if it fails.
