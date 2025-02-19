import { z } from "zod";

// define a schema for the notifications
export const notificationSchema = z.object({
    notifications: z.array(
        z.object({
            name: z.string().describe("Name of a fictional person."),
            message: z.string().describe("Message. Use as many emojis and links as possible. Like, use WAY TOO MANY emojis and links.")
        })
    )
})