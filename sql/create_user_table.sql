CREATE TABLE `User` (
    `kSelf` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `passwordHash` VARCHAR(255) NOT NULL,
    `isDailyReportEnabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `userLevel` ENUM('Administrator', 'User', 'Basic') NOT NULL,
    UNIQUE KEY `UNIQUE_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Password: p@ssw0rd
INSERT INTO `User` (email, passwordHash, userLevel)
VALUES ('admin@example.com', '$2a$10$NWcrnMPY0IL8e5zBpYRNwuul1pY5CN1AZtmWaaq.dGlCCAHjocZra', 'Administrator');