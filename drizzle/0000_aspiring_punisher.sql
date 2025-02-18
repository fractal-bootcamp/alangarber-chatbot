ALTER TABLE `fractal-chatbot_message` ADD COLUMN `chat_id` TEXT;
--> statement-breakpoint
CREATE INDEX `chat_idx` ON `fractal-chatbot_message` (`chat_id`);
