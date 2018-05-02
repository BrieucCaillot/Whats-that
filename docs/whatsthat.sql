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
	`created` DATETIME NOT NULL,
	`modified` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `word` (
	`id` int NOT NULL AUTO_INCREMENT,
	`user_id` int NOT NULL,
	`name` varchar(128) NOT NULL,
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

ALTER TABLE `word_bookmark` ADD CONSTRAINT `word_bookmark_fk0` FOREIGN KEY (`bookmark_id`) REFERENCES `word`(`id`);

ALTER TABLE `word_bookmark` ADD CONSTRAINT `word_bookmark_fk1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`);


INSERT INTO user(`lastname`, `firstname`, `email`, `gender`, `password`, `created`, `modified`) VALUES('Caillot', 'Brieuc', 'brieuc@gmail.com', 'M', '$2b$10$iNLsjbTziwM5ryPBo/ju8ObgTtY6nFq6v7/7NTJAvy9KamNgbiyKu', '2018-04-26 20:08:27', '2018-04-26 20:08:27');
INSERT INTO user(`lastname`, `firstname`, `email`, `gender`, `password`, `created`, `modified`) VALUES('Bernard', 'Jean-Michel', 'jeanmichel@gmail.com', 'M', '$2b$10$iNLsjbTziwM5ryPBo/ju8ObgTtY6nFq6v7/7NTJAvy9KamNgbiyKu', '2018-04-26 20:08:27', '2018-04-26 20:08:27');
--
INSERT INTO word(`user_id`, `name`, `definition`, `created`, `modified`) VALUES (1, 'itération','en informatique, procédé de calcul répétitif qui boucle jusqu''à ce qu''une condition particulière soit remplie.', '2018-04-26 20:08:27', '2018-04-26 20:08:27');
INSERT INTO word(`user_id`, `name`, `definition`, `created`, `modified`) VALUES (9, 'itération','méthode de résolution d''une équation par approximations successives.', '2018-04-26 20:08:27', '2018-04-26 20:08:27');