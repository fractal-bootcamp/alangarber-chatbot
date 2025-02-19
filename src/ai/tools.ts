import { tool as createTool } from "ai";
import { z } from "zod";

// server-side tool with execute function:
export const getWeatherInformation = createTool({
  description: "show the weather in a given city to the user",
  parameters: z.object({ city: z.string() }),
  execute: async ({}: { city: string }) => {
    const weatherOptions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
    return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  },
});

// client-side tool that starts user interaction:
export const askForConfirmation = createTool({
  description: "Ask the user for confirmation.",
  parameters: z.object({
    message: z.string().describe("The message to ask for confirmation."),
  }),
});

// client-side tool that is automatically executed on the client:
export const getLocation = createTool({
  description:
    "Get the user location. Always ask for confirmation before using this tool.",
  parameters: z.object({}),
});

// Add a new stock tool
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const ALPHAVANTAGE_URL = "https://www.alphavantage.co/query";

if (!ALPHAVANTAGE_API_KEY) {
  throw new Error("Missing AlphaVantage API key. Check your .env file.");
}

export const getStockInformation = createTool({
  description: "Get price for a stock",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol to get the price for"),
  }),
  execute: async function ({ symbol }) {
    try {
      const url = `${ALPHAVANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "request",
        },
      });

      if (!response.ok) {
        throw new Error(
          `AlphaVantage API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (!data["Global Quote"] || !data["Global Quote"]["05. price"]) {
        throw new Error("Invalid response format from AlphaVantage.");
      }

      return {
        symbol,
        price: parseFloat(data["Global Quote"]["05. price"]),
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return { error: "Failed to fetch stock price. Try again later." };
    }
  },
});

export const tools = {
  getWeatherInformation,
  askForConfirmation,
  getLocation,
  getStockInformation,
};
