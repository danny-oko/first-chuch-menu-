-- Preserve dish name on order items so dishes can be deleted safely
ALTER TABLE `order_items` ADD COLUMN `dish_name` text;
--> statement-breakpoint
UPDATE `order_items`
SET `dish_name` = (
  SELECT `name` FROM `dishes` WHERE `dishes`.`id` = `order_items`.`dish_id`
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `order_items_new` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`dish_id` text,
	`dish_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_at_purchase` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dish_id`) REFERENCES `dishes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `order_items_new` (`id`, `order_id`, `dish_id`, `dish_name`, `quantity`, `price_at_purchase`)
SELECT
	`id`,
	`order_id`,
	`dish_id`,
	COALESCE(`dish_name`, 'Unknown'),
	`quantity`,
	`price_at_purchase`
FROM `order_items`;
--> statement-breakpoint
DROP TABLE `order_items`;
--> statement-breakpoint
ALTER TABLE `order_items_new` RENAME TO `order_items`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
