CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`name` text NOT NULL,
	`species` text NOT NULL,
	`life_stage` text NOT NULL,
	`breed_sizes` text NOT NULL,
	`main_protein` text NOT NULL,
	`ingredients` text NOT NULL,
	`allergens` text NOT NULL,
	`grain_free` integer NOT NULL,
	`image_url` text,
	`buy_url` text NOT NULL
);
