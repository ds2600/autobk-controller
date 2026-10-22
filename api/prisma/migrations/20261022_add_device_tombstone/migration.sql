-- CreateTable
CREATE TABLE `DeviceTombstone` (
    `kSelf` INTEGER NOT NULL,
    `sName` VARCHAR(45) NOT NULL,
    `sType` ENUM('APEX', 'DCM', 'CAP', 'Inca1', 'Vista', 'OneNet', 'OneNetLog', 'TC600E', 'CXCHP', 'PSSend', 'Quartet', 'Inca2') NOT NULL,
    `sIP` VARCHAR(16) NOT NULL,
    `deletedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`kSelf`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
