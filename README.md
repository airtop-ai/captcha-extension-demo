# Captcha Solving Demo

This demo shows how to automate CAPTCHA solving using Airtop and the NopeCHA extension. It demonstrates configuring the extension and using it to solve a reCAPTCHA on Google's demo page.

## Prerequisites

- Node.js installed
- An Airtop API key
- NopeCHA extension configured with your API key

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Airtop API key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and add your Airtop API key.

## Usage

1. Run the script:
   `npm run dev`
2. Configure the extension (you only need to do this once)
3. Select `Solve a Captcha` from the menu