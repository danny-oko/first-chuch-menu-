ALTER TABLE `dishes` ADD `image_urls` text;
UPDATE `dishes` SET `image_urls` = json_array(`image_url`) WHERE `image_urls` IS NULL;
