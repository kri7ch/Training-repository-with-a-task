-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dbshoptech
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'Samsung'),(2,'Apple'),(3,'Sony'),(4,'Xiaomi'),(5,'Asus');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `device_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_device` (`user_id`,`device_id`),
  KEY `fk_cart_device` (`device_id`),
  CONSTRAINT `fk_cart_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (2,3,5,3),(21,4,4,1),(24,4,2,3);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_types`
--

DROP TABLE IF EXISTS `device_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_types`
--

LOCK TABLES `device_types` WRITE;
/*!40000 ALTER TABLE `device_types` DISABLE KEYS */;
INSERT INTO `device_types` VALUES (1,'Смартфоны'),(2,'Ноутбуки'),(3,'Наушники'),(4,'Планшеты'),(5,'Часы');
/*!40000 ALTER TABLE `device_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `model_name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `supplier_id` int NOT NULL,
  `brand_id` int NOT NULL,
  `type_id` int NOT NULL,
  `discount` int NOT NULL DEFAULT '0',
  `specifications` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_devices_type_idx` (`type_id`),
  KEY `fk_devices_supplier_idx` (`supplier_id`),
  KEY `fk_devices_brand_idx` (`brand_id`),
  CONSTRAINT `fk_devices_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  CONSTRAINT `fk_devices_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `fk_devices_type` FOREIGN KEY (`type_id`) REFERENCES `device_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'Samsung Galaxy S24 Ultra',146990,1,1,1,5,'6.8\" AMOLED 120Hz, Snapdragon 8 Gen 3, 12GB RAM, 512GB, S-Pen'),(2,'MacBook Pro 14 M3 Max',349990,2,2,2,0,'14.2\" Liquid Retina XDR, M3 Max 14-core CPU, 30-core GPU, 36GB RAM, 1TB SSD'),(3,'Sony WH-1000XM5 Black',34990,3,3,3,10,'Wireless Noise Cancelling Headphones, 30h battery, LDAC, Multipoint'),(4,'iPhone 15 Pro Max',189990,2,2,1,3,'6.7\" Super Retina XDR, A17 Pro, 8GB RAM, 256GB, Titanium'),(5,'iPad Air M2',74990,2,2,4,0,'11\" Liquid Retina, M2 chip, 8GB RAM, 128GB, WiFi'),(6,'Xiaomi 14 Ultra',119990,1,4,1,15,'6.73\" AMOLED, Snapdragon 8 Gen 3, Leica optics, 16GB RAM, 512GB'),(7,'Asus ROG Zephyrus G16',259990,3,5,2,5,'16\" OLED 240Hz, Intel Core Ultra 9, RTX 4070, 32GB RAM, 1TB SSD'),(8,'Apple Watch Series 9',45990,2,2,5,0,'45mm Aluminum Case, S9 SiP, Always-On Retina, Blood Oxygen app'),(9,'Samsung Galaxy Tab S9',82990,1,1,4,8,'11\" Dynamic AMOLED 2X, Snapdragon 8 Gen 2, 8GB RAM, 128GB, S-Pen included'),(10,'Sony WF-1000XM5',26990,3,3,3,0,'Truly Wireless Noise Cancelling Earbuds, AI-based noise reduction');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `device_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_images_device_idx` (`device_id`),
  CONSTRAINT `fk_images_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `images`
--

LOCK TABLES `images` WRITE;
/*!40000 ALTER TABLE `images` DISABLE KEYS */;
INSERT INTO `images` VALUES (29,'mbp14_1.png',2),(30,'mbp14_2.png',2),(31,'wh1000xm5_1.png',3),(32,'wh1000xm5_2.png',3),(33,'iphone15pm_1.png',4),(34,'iphone15pm_2.png',4),(35,'iphone15pm_3.png',4),(36,'ipad_air_1.png',5),(37,'ipad_air_2.png',5),(38,'xiaomi14u_1.png',6),(39,'xiaomi14u_2.png',6),(40,'rog_g16_1.png',7),(41,'rog_g16_2.png',7),(42,'aw9_1.png',8),(43,'aw9_2.png',8),(50,'tabs9_1.png',9),(51,'wf1000xm5_1.png',10),(54,'s24_ultra_1.png',1);
/*!40000 ALTER TABLE `images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `device_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_device_idx` (`device_id`),
  KEY `fk_order_items_order_idx` (`order_id`),
  CONSTRAINT `fk_order_items_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (4,4,4,13,184290),(5,4,5,3,74990),(16,6,8,1,45990),(17,7,4,1,184290);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_date` date NOT NULL,
  `delivery_date` date NOT NULL,
  `pickup_point_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_code` int NOT NULL,
  `order_status` varchar(45) NOT NULL DEFAULT 'Оформлен',
  PRIMARY KEY (`id`),
  KEY `fk_orders_user_idx` (`user_id`),
  KEY `fk_orders_pickup_point_idx` (`pickup_point_id`),
  CONSTRAINT `fk_orders_pickup_point` FOREIGN KEY (`pickup_point_id`) REFERENCES `pickup_points` (`id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (4,'2026-02-16','2026-02-19',1,3,442,'Оформлен'),(6,'2026-02-25','2026-02-28',1,4,435,'Оформлен'),(7,'2026-02-25','2026-02-28',2,4,772,'Оформлен');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickup_points`
--

DROP TABLE IF EXISTS `pickup_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickup_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `postal_code` varchar(45) NOT NULL,
  `city` varchar(100) NOT NULL,
  `street` varchar(100) NOT NULL,
  `house_number` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickup_points`
--

LOCK TABLES `pickup_points` WRITE;
/*!40000 ALTER TABLE `pickup_points` DISABLE KEYS */;
INSERT INTO `pickup_points` VALUES (1,'620000','Екатеринбург','ул. Ленина','50'),(2,'630000','Новосибирск','проспект Карла Маркса','12'),(3,'125009','Москва','ул. Тверская','25');
/*!40000 ALTER TABLE `pickup_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit` enum('шт.') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stocks_device_idx` (`device_id`),
  CONSTRAINT `fk_stocks_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,1,10,'шт.'),(2,2,5,'шт.'),(3,3,20,'шт.'),(4,4,15,'шт.'),(5,5,12,'шт.'),(6,6,8,'шт.'),(7,7,4,'шт.'),(8,8,25,'шт.'),(9,9,7,'шт.'),(10,10,30,'шт.');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'ООО \"Электроторг\"'),(2,'ИП \"ГаджетСнаб\"'),(3,'АО \"ТехноИмпорт\"');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('администратор','менеджер','клиент') NOT NULL DEFAULT 'клиент',
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Иванов','Иван','Иванович','admin@shop.ru','qweqwe','администратор','2026-02-26 11:37:32'),(2,'Петрова','Мария','Сергеевна','admin2@shop.ru','qweqwe','администратор','2026-02-26 11:37:32'),(3,'Сидоров','Алексей','Владимирович','client@mail.ru','qweqwe','клиент','2026-02-26 11:37:32'),(4,'Рахмаев','Данил','Денисович','qwe@qwe.qwe','qweqwe','клиент','2026-02-26 11:37:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11 18:33:00
