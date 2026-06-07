ALTER TABLE `orders` ADD `customer_name` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `order_number` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
WITH `numbered` AS (
  SELECT `id`, ROW_NUMBER() OVER (ORDER BY `created_at` ASC, `id` ASC) AS `rn`
  FROM `orders`
)
UPDATE `orders`
SET `order_number` = (
  SELECT `rn` FROM `numbered` WHERE `numbered`.`id` = `orders`.`id`
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);
