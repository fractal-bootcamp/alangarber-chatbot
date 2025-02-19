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
export const getStockInformation = createTool({
  description: "Get price for a stock",
  parameters: z.object({
    symbol: z.string().describe("The stock symbol to get the price for"),
  }),
  execute: async function ({ symbol }) {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { symbol, price: 100 };
  },
});

export const tools = {
  getWeatherInformation,
  askForConfirmation,
  getLocation,
  getStockInformation,
};
