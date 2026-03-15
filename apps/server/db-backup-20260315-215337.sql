-- MySQL dump 10.13  Distrib 9.2.0, for Linux (x86_64)
--
-- Host: localhost    Database: account_docu
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('BANK','CREDIT_CARD','CASH','INVESTMENT','LOAN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `initial_balance` decimal(65,30) DEFAULT NULL,
  `initial_balance_date` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_user_id_fkey` (`user_id`),
  CONSTRAINT `account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('1d543e94-d7f8-4207-890c-5fc4792c638d','768c9b8f-fc2f-4581-9cba-1d9661920722','현금','CASH',0.000000000000000000000000000000,1,0,0,'2026-03-15 02:43:56.587','2026-03-15 02:43:56.587',NULL,NULL),('365ed801-3cf1-48a0-bdc3-86e3059e262e','768c9b8f-fc2f-4581-9cba-1d9661920722','은행','BANK',0.000000000000000000000000000000,0,0,1,'2026-03-15 08:34:07.290','2026-03-15 08:34:07.290',NULL,NULL),('ce50fca6-7b92-4271-89c4-664685dea40d','768c9b8f-fc2f-4581-9cba-1d9661920722','카드','CREDIT_CARD',0.000000000000000000000000000000,0,0,2,'2026-03-15 08:34:07.313','2026-03-15 08:34:07.313',NULL,NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget`
--

DROP TABLE IF EXISTS `budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `alert_at` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `budget_user_id_category_id_year_month_key` (`user_id`,`category_id`,`year`,`month`),
  KEY `budget_category_id_fkey` (`category_id`),
  CONSTRAINT `budget_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `budget_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget`
--

LOCK TABLES `budget` WRITE;
/*!40000 ALTER TABLE `budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_user_id_fkey` (`user_id`),
  KEY `category_parent_id_fkey` (`parent_id`),
  CONSTRAINT `category_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('0d763fd1-0fd9-4a00-9e18-59a228348df9','768c9b8f-fc2f-4581-9cba-1d9661920722','교통비','EXPENSE',NULL,'2026-03-15 02:43:56.672','2026-03-15 02:43:56.672'),('1049aa7c-2ddf-4525-aa1c-b5a0c63faca0','768c9b8f-fc2f-4581-9cba-1d9661920722','카페/간식','EXPENSE',NULL,'2026-03-15 02:43:56.657','2026-03-15 02:43:56.657'),('137aee2f-71f4-49f8-a9f7-ce732f4bbdfe','768c9b8f-fc2f-4581-9cba-1d9661920722','문화/취미','EXPENSE',NULL,'2026-03-15 02:43:56.731','2026-03-15 02:43:56.731'),('2a538a0a-60ca-4177-a85b-59c39c09a097','768c9b8f-fc2f-4581-9cba-1d9661920722','뷰티/미용','EXPENSE',NULL,'2026-03-15 02:43:56.705','2026-03-15 02:43:56.705'),('39be2a4f-f198-4434-a60f-a1d42301239b','768c9b8f-fc2f-4581-9cba-1d9661920722','이체','EXPENSE',NULL,'2026-03-15 07:52:17.353','2026-03-15 07:52:17.353'),('3cc2f921-b7ec-4edb-baa7-be1123adaee5','768c9b8f-fc2f-4581-9cba-1d9661920722','식비','EXPENSE',NULL,'2026-03-15 02:43:56.649','2026-03-15 02:43:56.649'),('3da89403-d134-4381-b651-c2651eb4b72c','768c9b8f-fc2f-4581-9cba-1d9661920722','의료','EXPENSE',NULL,'2026-03-15 02:43:56.711','2026-03-15 02:43:56.711'),('49598bdf-7fbe-4a08-abfb-32040d39c8b0','768c9b8f-fc2f-4581-9cba-1d9661920722','사업수입','INCOME',NULL,'2026-03-15 02:43:56.618','2026-03-15 02:43:56.618'),('5c43aad1-7317-45e5-b920-c05b319bc26d','768c9b8f-fc2f-4581-9cba-1d9661920722','반려동물','EXPENSE',NULL,'2026-03-15 02:43:56.758','2026-03-15 02:43:56.758'),('626619e4-9ca5-4787-ac3b-29500b2e5e51','768c9b8f-fc2f-4581-9cba-1d9661920722','간식','EXPENSE',NULL,'2026-03-15 12:37:46.203','2026-03-15 12:37:46.203'),('66af2ddb-e80f-48f5-8dbd-5e4993d01dbb','768c9b8f-fc2f-4581-9cba-1d9661920722','모임 비용','EXPENSE',NULL,'2026-03-15 02:43:56.664','2026-03-15 02:43:56.664'),('69fe127b-044e-44b9-bcae-b92c551aa7fd','768c9b8f-fc2f-4581-9cba-1d9661920722','구독/정기','EXPENSE',NULL,'2026-03-15 08:42:33.588','2026-03-15 08:42:33.588'),('760e3278-bf76-46d3-af8f-622f0a16c180','768c9b8f-fc2f-4581-9cba-1d9661920722','기타지출','EXPENSE',NULL,'2026-03-15 02:43:56.764','2026-03-15 02:43:56.764'),('982cf635-a82d-4024-8a1f-2968c1b6b485','768c9b8f-fc2f-4581-9cba-1d9661920722','통신비','EXPENSE',NULL,'2026-03-15 02:43:56.692','2026-03-15 02:43:56.692'),('9ddf39d2-1f71-4c09-acf7-189d8fffe470','768c9b8f-fc2f-4581-9cba-1d9661920722','주거비','EXPENSE',NULL,'2026-03-15 02:43:56.685','2026-03-15 02:43:56.685'),('a386392c-c922-4246-8e2a-d3790b1df958','768c9b8f-fc2f-4581-9cba-1d9661920722','월급','INCOME',NULL,'2026-03-15 02:43:56.602','2026-03-15 02:43:56.602'),('ac7c9f3d-5565-4d47-99b7-b0fed08cfa45','768c9b8f-fc2f-4581-9cba-1d9661920722','모임','EXPENSE',NULL,'2026-03-15 12:37:46.238','2026-03-15 12:37:46.238'),('b5821518-e110-4d54-a243-49d9ffa84be4','768c9b8f-fc2f-4581-9cba-1d9661920722','교육','EXPENSE',NULL,'2026-03-15 02:43:56.724','2026-03-15 02:43:56.724'),('b8de30f7-11d5-4d96-b59a-1815e6193e67','768c9b8f-fc2f-4581-9cba-1d9661920722','이자/배당','INCOME',NULL,'2026-03-15 02:43:56.626','2026-03-15 02:43:56.626'),('b9d98f73-9955-486e-a4ba-28057a19dfb9','768c9b8f-fc2f-4581-9cba-1d9661920722','자동차','EXPENSE',NULL,'2026-03-15 02:43:56.678','2026-03-15 02:43:56.678'),('c77a84e3-3d2c-46ab-b4cd-6791dab70957','768c9b8f-fc2f-4581-9cba-1d9661920722','용돈','INCOME',NULL,'2026-03-15 02:43:56.633','2026-03-15 02:43:56.633'),('cefd5881-02f4-4433-b152-62b8dc2fd64a','768c9b8f-fc2f-4581-9cba-1d9661920722','자녀/육아','EXPENSE',NULL,'2026-03-15 02:43:56.751','2026-03-15 02:43:56.751'),('d4326020-e034-4735-a5c3-fd0f389d7b2f','768c9b8f-fc2f-4581-9cba-1d9661920722','여행/숙박','EXPENSE',NULL,'2026-03-15 02:43:56.738','2026-03-15 02:43:56.738'),('d596cc48-29c6-4c78-8800-016aeafde468','768c9b8f-fc2f-4581-9cba-1d9661920722','기타수입','INCOME',NULL,'2026-03-15 02:43:56.642','2026-03-15 02:43:56.642'),('d70fa1d9-42e6-45a5-a97d-1c82b12a36d4','768c9b8f-fc2f-4581-9cba-1d9661920722','건강/운동','EXPENSE',NULL,'2026-03-15 02:43:56.717','2026-03-15 02:43:56.717'),('de4677b3-ea36-4ded-b94d-abe36387ac94','768c9b8f-fc2f-4581-9cba-1d9661920722','경조사/선물','EXPENSE',NULL,'2026-03-15 02:43:56.745','2026-03-15 02:43:56.745'),('edff4c8e-428c-4420-9a82-6782c8a0159f','768c9b8f-fc2f-4581-9cba-1d9661920722','쇼핑','EXPENSE',NULL,'2026-03-15 02:43:56.698','2026-03-15 02:43:56.698'),('eeb048d9-6bdf-420e-a695-0addc641242a','768c9b8f-fc2f-4581-9cba-1d9661920722','이체','INCOME',NULL,'2026-03-15 08:51:18.848','2026-03-15 08:51:18.848'),('f3cb7cd1-68d8-4084-a7a1-ceda8982d2a7','768c9b8f-fc2f-4581-9cba-1d9661920722','부수입','INCOME',NULL,'2026-03-15 02:43:56.610','2026-03-15 02:43:56.610');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE','TRANSFER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `date` datetime(3) NOT NULL,
  `scheduled_at` datetime(3) DEFAULT NULL,
  `is_fixed` tinyint(1) NOT NULL DEFAULT '0',
  `memo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `labels` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transaction_user_id_fkey` (`user_id`),
  KEY `transaction_account_id_fkey` (`account_id`),
  KEY `transaction_category_id_fkey` (`category_id`),
  CONSTRAINT `transaction_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transaction_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES ('00b4d8e0-da59-4191-9648-98b0bc89e5ee','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','760e3278-bf76-46d3-af8f-622f0a16c180','EXPENSE',5800.000000000000000000000000000000,'2026-02-01 03:00:00.000',NULL,0,'소프트먼트',NULL,'2026-03-15 08:52:34.215','2026-03-15 08:54:35.676'),('05a8a46e-c659-4fa3-8c71-e1c2321c015d','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',12000.000000000000000000000000000000,'2026-02-13 03:00:00.000',NULL,0,NULL,NULL,'2026-03-15 12:32:40.219','2026-03-15 12:32:40.219'),('07676864-74aa-4b46-82a4-ccfe8cf15d60','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','eeb048d9-6bdf-420e-a695-0addc641242a','INCOME',100000.000000000000000000000000000000,'2026-02-15 03:00:00.000',NULL,0,NULL,NULL,'2026-03-15 12:35:03.556','2026-03-15 12:35:03.556'),('1d8443aa-e078-48d3-a28c-eae2c2eac6fc','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',18100.000000000000000000000000000000,'2026-02-13 03:00:00.000',NULL,0,'(주)우아한형제',NULL,'2026-03-15 12:32:58.498','2026-03-15 12:32:58.498'),('205e8061-6884-4436-95b1-0e1a549e5682','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','eeb048d9-6bdf-420e-a695-0addc641242a','INCOME',10000.000000000000000000000000000000,'2026-02-14 03:00:00.000',NULL,0,NULL,NULL,'2026-03-15 12:33:39.884','2026-03-15 12:33:39.884'),('2afd413d-1bd6-4a68-bd39-685558fcfba5','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','edff4c8e-428c-4420-9a82-6782c8a0159f','EXPENSE',6000.000000000000000000000000000000,'2026-02-01 03:00:00.000',NULL,0,'다이소',NULL,'2026-03-15 08:53:38.883','2026-03-15 08:53:38.883'),('33ed130e-98ff-4324-a56a-6f9d19374801','768c9b8f-fc2f-4581-9cba-1d9661920722','365ed801-3cf1-48a0-bdc3-86e3059e262e','eeb048d9-6bdf-420e-a695-0addc641242a','INCOME',100000.000000000000000000000000000000,'2026-02-01 03:00:00.000',NULL,0,'내 계좌 타은행 이체',NULL,'2026-03-15 08:51:47.921','2026-03-15 08:54:53.621'),('47842de9-71ac-4132-a69e-f29f5c6d7bb7','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',22000.000000000000000000000000000000,'2026-02-15 03:00:00.000',NULL,0,'갑이손짜장',NULL,'2026-03-15 12:34:44.751','2026-03-15 12:34:44.751'),('4d79b7a2-0f3e-4f9d-9117-e2939859a0aa','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',24800.000000000000000000000000000000,'2026-02-14 03:00:00.000',NULL,0,'(주)우아한형제',NULL,'2026-03-15 12:34:28.238','2026-03-15 12:34:28.238'),('87c7426d-2097-4369-968a-05977507f1ab','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','edff4c8e-428c-4420-9a82-6782c8a0159f','EXPENSE',49900.000000000000000000000000000000,'2026-02-01 03:00:00.000',NULL,0,'유니클로',NULL,'2026-03-15 08:54:02.694','2026-03-15 08:54:02.694'),('881e272e-110d-4282-872d-1abfef2dcd74','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',5000.000000000000000000000000000000,'2026-02-13 03:00:00.000',NULL,0,'GS',NULL,'2026-03-15 12:33:12.998','2026-03-15 12:33:12.998'),('abe72bc5-e4f4-427b-9b50-863decf0c357','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','69fe127b-044e-44b9-bcae-b92c551aa7fd','EXPENSE',32292.000000000000000000000000000000,'2026-02-13 03:00:00.000',NULL,1,'OPENAI',NULL,'2026-03-15 12:32:16.776','2026-03-15 12:32:16.776'),('b57fe6cf-4f12-4186-b649-5319b0a5f9a5','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','39be2a4f-f198-4434-a60f-a1d42301239b','EXPENSE',1000000.000000000000000000000000000000,'2026-03-10 03:00:00.000',NULL,0,NULL,NULL,'2026-03-15 08:31:39.685','2026-03-15 08:41:26.214'),('e92d9076-b866-4930-8763-34a75debd389','768c9b8f-fc2f-4581-9cba-1d9661920722','365ed801-3cf1-48a0-bdc3-86e3059e262e','39be2a4f-f198-4434-a60f-a1d42301239b','EXPENSE',4059.000000000000000000000000000000,'2026-02-01 03:00:00.000',NULL,0,'내 계좌 타은행 이체',NULL,'2026-03-15 08:50:31.881','2026-03-15 08:55:04.799'),('f8814539-f50c-47c4-bd78-fbd6a2f30fec','768c9b8f-fc2f-4581-9cba-1d9661920722','ce50fca6-7b92-4271-89c4-664685dea40d','3cc2f921-b7ec-4edb-baa7-be1123adaee5','EXPENSE',20500.000000000000000000000000000000,'2026-02-14 03:00:00.000',NULL,0,'(주)우아한형제',NULL,'2026-03-15 12:34:08.321','2026-03-15 12:34:08.321');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KRW',
  `locale` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ko-KR',
  `timezone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Seoul',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('768c9b8f-fc2f-4581-9cba-1d9661920722','demo@local','Demo','KRW','ko-KR','Asia/Seoul','2026-03-15 02:43:56.562','2026-03-15 02:43:56.562');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-15 12:53:38
