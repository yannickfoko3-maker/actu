-- ---------------------------------------------------------------------------
-- ACES GLOBAL SERVICES — Installation manuelle de la base de données
-- ---------------------------------------------------------------------------
-- MySQL 8.0+ / MariaDB 10.6+ · utf8mb4
--
-- Deux méthodes d'installation sont possibles :
--
--   MÉTHODE A (recommandée, avec Prisma) :
--     npm run db:push        -> Prisma crée toutes les tables
--     npm run db:seed        -> données initiales (prestations, pages, admin…)
--
--   MÉTHODE B (import manuel, phpMyAdmin, hébergement mutualisé) :
--     1. importer CE fichier dans la base
--     2. lancer ensuite : npm run db:seed
--        (le script Prisma complète les tables existantes, il est idempotent)
--
-- Ne mélangez pas les deux méthodes sur une base déjà initialisée.
-- Les noms de tables sont ceux générés par Prisma (casse exacte).
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Décommentez et adaptez si votre hébergeur ne fournit pas encore la base :
-- CREATE DATABASE IF NOT EXISTS `aces_global_services`
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `aces_global_services`;

-- ---------------------------------------------------------------------------
-- Rôles, permissions et comptes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Role` (
  `id`          VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `label`       VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `permissions` JSON NOT NULL,
  `isSystem`    BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Permission` (
  `id`        VARCHAR(191) NOT NULL,
  `code`      VARCHAR(191) NOT NULL,
  `label`     VARCHAR(191) NOT NULL,
  `group`     VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminUser` (
  `id`           VARCHAR(191) NOT NULL,
  `name`         VARCHAR(191) NOT NULL,
  `email`        VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `roleId`       VARCHAR(191) NOT NULL,
  `isActive`     BOOLEAN NOT NULL DEFAULT TRUE,
  `lastLoginAt`  DATETIME(3) NULL,
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AdminUser_email_key` (`email`),
  KEY `AdminUser_roleId_idx` (`roleId`),
  CONSTRAINT `AdminUser_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ActivityLog` (
  `id`          VARCHAR(191) NOT NULL,
  `userId`      VARCHAR(191) NULL,
  `userName`    VARCHAR(191) NOT NULL,
  `action`      VARCHAR(191) NOT NULL,
  `entity`      VARCHAR(191) NOT NULL,
  `entityId`    VARCHAR(191) NULL,
  `description` TEXT NOT NULL,
  `ip`          VARCHAR(191) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ActivityLog_userId_idx` (`userId`),
  KEY `ActivityLog_createdAt_idx` (`createdAt`),
  CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Contenus du site
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Service` (
  `id`               VARCHAR(191) NOT NULL,
  `slug`             VARCHAR(191) NOT NULL,
  `title`            VARCHAR(191) NOT NULL,
  `tagline`          VARCHAR(191) NOT NULL,
  `shortDescription` TEXT NOT NULL,
  `description`      LONGTEXT NOT NULL,
  `icon`             VARCHAR(191) NOT NULL DEFAULT 'shield',
  `heroImage`        VARCHAR(191) NOT NULL,
  `coverImage`       VARCHAR(191) NOT NULL,
  `benefits`         JSON NOT NULL,
  `features`         JSON NOT NULL,
  `applications`     JSON NOT NULL,
  `process`          JSON NOT NULL,
  `equipment`        JSON NOT NULL,
  `faqs`             JSON NOT NULL,
  `seoTitle`         VARCHAR(191) NULL,
  `seoDescription`   TEXT NULL,
  `order`            INT NOT NULL DEFAULT 0,
  `isPublished`      BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Service_slug_key` (`slug`),
  KEY `Service_isPublished_order_idx` (`isPublished`, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ServiceImage` (
  `id`        VARCHAR(191) NOT NULL,
  `serviceId` VARCHAR(191) NOT NULL,
  `url`       VARCHAR(191) NOT NULL,
  `alt`       VARCHAR(191) NOT NULL DEFAULT '',
  `order`     INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ServiceImage_serviceId_order_idx` (`serviceId`, `order`),
  CONSTRAINT `ServiceImage_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Page` (
  `id`             VARCHAR(191) NOT NULL,
  `slug`           VARCHAR(191) NOT NULL,
  `title`          VARCHAR(191) NOT NULL,
  `subtitle`       VARCHAR(191) NULL,
  `heroImage`      VARCHAR(191) NULL,
  `content`        LONGTEXT NOT NULL,
  `sections`       JSON NULL,
  `seoTitle`       VARCHAR(191) NULL,
  `seoDescription` TEXT NULL,
  `status`         VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED',
  `system`         BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Page_slug_key` (`slug`),
  KEY `Page_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `HeroSlide` (
  `id`             VARCHAR(191) NOT NULL,
  `title`          VARCHAR(191) NOT NULL,
  `subtitle`       TEXT NOT NULL,
  `image`          VARCHAR(191) NOT NULL,
  `eyebrow`        VARCHAR(191) NULL,
  `primaryLabel`   VARCHAR(191) NOT NULL DEFAULT 'Demander un devis',
  `primaryUrl`     VARCHAR(191) NOT NULL DEFAULT '/devis',
  `secondaryLabel` VARCHAR(191) NOT NULL DEFAULT 'Découvrir nos solutions',
  `secondaryUrl`   VARCHAR(191) NOT NULL DEFAULT '/nos-activites',
  `order`          INT NOT NULL DEFAULT 0,
  `isActive`       BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `HeroSlide_isActive_order_idx` (`isActive`, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Project` (
  `id`          VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `title`       VARCHAR(191) NOT NULL,
  `category`    VARCHAR(191) NOT NULL,
  `client`      VARCHAR(191) NULL,
  `location`    VARCHAR(191) NOT NULL,
  `year`        INT NULL,
  `summary`     TEXT NOT NULL,
  `description` LONGTEXT NOT NULL,
  `coverImage`  VARCHAR(191) NOT NULL,
  `isPublished` BOOLEAN NOT NULL DEFAULT TRUE,
  `featured`    BOOLEAN NOT NULL DEFAULT FALSE,
  `order`       INT NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Project_slug_key` (`slug`),
  KEY `Project_isPublished_category_idx` (`isPublished`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProjectImage` (
  `id`        VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `url`       VARCHAR(191) NOT NULL,
  `alt`       VARCHAR(191) NOT NULL DEFAULT '',
  `order`     INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ProjectImage_projectId_order_idx` (`projectId`, `order`),
  CONSTRAINT `ProjectImage_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Category` (
  `id`          VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `name`        VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `kind`        VARCHAR(191) NOT NULL DEFAULT 'article',
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Article` (
  `id`             VARCHAR(191) NOT NULL,
  `slug`           VARCHAR(191) NOT NULL,
  `title`          VARCHAR(191) NOT NULL,
  `excerpt`        TEXT NOT NULL,
  `content`        LONGTEXT NOT NULL,
  `coverImage`     VARCHAR(191) NOT NULL,
  `categoryId`     VARCHAR(191) NULL,
  `tags`           JSON NOT NULL,
  `author`         VARCHAR(191) NOT NULL DEFAULT 'ACES Global Services',
  `status`         VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `publishedAt`    DATETIME(3) NULL,
  `readingTime`    INT NOT NULL DEFAULT 4,
  `views`          INT NOT NULL DEFAULT 0,
  `seoTitle`       VARCHAR(191) NULL,
  `seoDescription` TEXT NULL,
  `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Article_slug_key` (`slug`),
  KEY `Article_status_publishedAt_idx` (`status`, `publishedAt`),
  KEY `Article_categoryId_idx` (`categoryId`),
  CONSTRAINT `Article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Media` (
  `id`           VARCHAR(191) NOT NULL,
  `filename`     VARCHAR(191) NOT NULL,
  `originalName` VARCHAR(191) NOT NULL,
  `url`          VARCHAR(191) NOT NULL,
  `thumbnailUrl` VARCHAR(191) NULL,
  `mimeType`     VARCHAR(191) NOT NULL,
  `size`         INT NOT NULL,
  `width`        INT NULL,
  `height`       INT NULL,
  `alt`          VARCHAR(191) NOT NULL DEFAULT '',
  `caption`      VARCHAR(191) NOT NULL DEFAULT '',
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Media_mimeType_idx` (`mimeType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Testimonial` (
  `id`          VARCHAR(191) NOT NULL,
  `authorName`  VARCHAR(191) NOT NULL,
  `authorRole`  VARCHAR(191) NULL,
  `company`     VARCHAR(191) NULL,
  `content`     TEXT NOT NULL,
  `rating`      INT NOT NULL DEFAULT 5,
  `photo`       VARCHAR(191) NULL,
  `isPublished` BOOLEAN NOT NULL DEFAULT FALSE,
  `order`       INT NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Testimonial_isPublished_order_idx` (`isPublished`, `order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Demandes commerciales
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ContactMessage` (
  `id`        VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `email`     VARCHAR(191) NOT NULL,
  `phone`     VARCHAR(191) NOT NULL,
  `subject`   VARCHAR(191) NOT NULL,
  `message`   TEXT NOT NULL,
  `status`    VARCHAR(191) NOT NULL DEFAULT 'NEW',
  `ip`        VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ContactMessage_status_createdAt_idx` (`status`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `QuoteRequest` (
  `id`                 VARCHAR(191) NOT NULL,
  `name`               VARCHAR(191) NOT NULL,
  `company`            VARCHAR(191) NULL,
  `email`              VARCHAR(191) NOT NULL,
  `phone`              VARCHAR(191) NOT NULL,
  `city`               VARCHAR(191) NOT NULL,
  `serviceSlug`        VARCHAR(191) NULL,
  `serviceTitle`       VARCHAR(191) NOT NULL,
  `projectDescription` TEXT NOT NULL,
  `budget`             VARCHAR(191) NULL,
  `preferredContact`   VARCHAR(191) NOT NULL DEFAULT 'phone',
  `consent`            BOOLEAN NOT NULL DEFAULT TRUE,
  `status`             VARCHAR(191) NOT NULL DEFAULT 'NEW',
  `internalNotes`      LONGTEXT NULL,
  `ip`                 VARCHAR(191) NULL,
  `createdAt`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `QuoteRequest_status_createdAt_idx` (`status`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Paramètres du site (clé / valeur)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `SiteSetting` (
  `id`        VARCHAR(191) NOT NULL,
  `key`       VARCHAR(191) NOT NULL,
  `value`     TEXT NOT NULL,
  `group`     VARCHAR(191) NOT NULL DEFAULT 'general',
  `label`     VARCHAR(191) NULL,
  `type`      VARCHAR(191) NOT NULL DEFAULT 'text',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SiteSetting_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Étape suivante : peupler la base avec les données initiales
--
--   cd backend
--   npm run db:seed
--
-- Le script crée les rôles, les 11 prestations, les pages, le carrousel,
-- les paramètres du site et le premier compte administrateur :
--   e-mail       : admin@aces-globalservices.com   (ou SEED_ADMIN_EMAIL)
--   mot de passe : AcesAdmin2025!                  (ou SEED_ADMIN_PASSWORD)
-- Modifiez ce mot de passe immédiatement après la première connexion.
-- ---------------------------------------------------------------------------
