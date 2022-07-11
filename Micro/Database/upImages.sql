
CREATE TABLE IF NOT EXISTS  `UImages` (
    `id` INTEGER PRIMARY KEY,
    `storage` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NULL DEFAULT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(50) NULL DEFAULT NULL,
    `keywords` VARCHAR(50) NULL DEFAULT NULL,
    `stars` INTEGER(11) NULL DEFAULT NULL,
    `width` INTEGER(11) NULL DEFAULT NULL,
    `height` INTEGER(11) NULL DEFAULT NULL,
    `size` INTEGER(11) NULL DEFAULT NULL
    );
