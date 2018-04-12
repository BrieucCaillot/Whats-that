DROP DATABASE IF EXISTS whatsthat;
CREATE DATABASE whatsthat;
USE whatsthat;

CREATE TABLE `user` (
	`id` int NOT NULL AUTO_INCREMENT,
	`firstname` varchar(128) NOT NULL,
	`lastname` varchar(128) NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`gender` varchar(1) NOT NULL,
	`password` varchar(128) NOT NULL,
	`repassword` varchar(128) NOT NULL,
	`created` DATETIME NOT NULL,
	`modified` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `word` (
	`id` int NOT NULL AUTO_INCREMENT,
	`user_id` int NOT NULL,
	`firstname` varchar(128) NOT NULL,
	`lastname` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL UNIQUE,
	`definition` varchar(500) NOT NULL,
	`created` DATETIME NOT NULL,
	`modified` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `word_bookmark` (
	`id` int NOT NULL AUTO_INCREMENT,
	`bookmark_id` int NOT NULL,
	`user_id` int NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `word` ADD CONSTRAINT `word_fk0` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`);

ALTER TABLE `word` ADD CONSTRAINT `word_fk1` FOREIGN KEY (`firstname`) REFERENCES `user`(`firstname`);

ALTER TABLE `word` ADD CONSTRAINT `word_fk2` FOREIGN KEY (`lastname`) REFERENCES `user`(`lastname`);

ALTER TABLE `word_bookmark` ADD CONSTRAINT `word_bookmark_fk0` FOREIGN KEY (`bookmark_id`) REFERENCES `word`(`id`);

ALTER TABLE `word_bookmark` ADD CONSTRAINT `word_bookmark_fk1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`);

