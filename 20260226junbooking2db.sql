-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Feb 26, 2026 at 10:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `junbooking2db`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`booking_id`, `user_id`, `date`, `time`, `notes`, `created_at`, `updated_at`) VALUES
(260003, 3, '2026-04-12', '11:00:00', 'Back pain treatment', '2026-02-14 04:14:10', '2026-02-14 04:18:35'),
(260021, 10, '2026-02-26', '13:00:00', 'strsgr', '2026-02-18 06:39:43', '2026-02-18 06:39:43'),
(260022, 4, '2026-02-20', '16:00:00', 'sdbfb', '2026-02-18 06:41:19', '2026-02-18 06:41:19'),
(260027, 2, '2026-03-24', '11:00:00', 'sfhfdjfg', '2026-02-25 05:37:15', '2026-02-25 05:37:15'),
(260028, 4, '2026-02-27', '09:30:00', 'zz   cvbxthr', '2026-02-25 08:38:37', '2026-02-25 08:38:37'),
(260029, 11, '2026-03-09', '16:00:00', 'dsdggsfgfsggs', '2026-02-26 07:37:42', '2026-02-26 07:38:33');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `faq_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`faq_id`, `question`, `answer`, `created_at`, `updated_at`) VALUES
(1, 'What is acupuncture?', 'Acupuncture is one of the important treatment methods in traditional Chinese medicine. Acupuncture stimulates specific acupoints on the body\'s meridians to promote the circulation of qi and blood, improve the function of internal organs, and help restore the body\'s yin-yang balance.', '2026-02-12 09:45:39', '2026-02-12 09:46:02'),
(2, 'What are acupuncture points?', 'Acupoints are specific locations on the meridians of the human body, and different acupoints have different functions. Acupuncturists use different techniques to treat various diseases, and they are particularly effective in relieving pain.', '2026-02-12 09:45:39', '2026-02-12 09:46:02'),
(3, 'Can acupuncture relieve headaches?', 'Yes. Headaches can be caused by various reasons, by identifying the correct acupoints, and using appropriate techniques through traditional Chinese medicine diagnosis, the treatment effect will be better.', '2026-02-12 09:45:39', '2026-02-12 09:46:02'),
(4, 'Can acupuncture help alleviate poor sleep?', 'Yes. Poor sleep can be caused by various reasons, requiring diagnosis and treatment based on the specific cause.', '2026-02-12 09:45:39', '2026-02-12 09:46:02'),
(5, 'Is acupuncture effective for frozen shoulder?', 'Yes, acupuncture, massage, and cupping are all very effective in improving the symptoms of frozen shoulder.', '2026-02-12 09:45:39', '2026-02-12 09:46:02'),
(6, 'What is Tui Na?', 'Tui Na is a traditional Chinese massage technique...', '2026-02-12 09:49:30', '2026-02-12 09:50:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(56) NOT NULL,
  `phone_number` varchar(56) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(256) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `phone_number`, `email`, `password`, `created_at`, `updated_at`, `role`) VALUES
(1, 'admin', '0271111111', 'admin@jhh.com', '$2b$10$6JOnWIVlBK93SVxIgK2oYOi1YRrkGBFfleg7dilMispmgbnExLePy', '2026-02-13 00:24:53', '2026-02-15 02:08:26', 'admin'),
(2, 'test1', '0211234567', 'test1@gmail.com', '$2b$10$.dXlkTZDJozIOg.Qu27jC.JeAUpDt.C.1ehcmaRRd44GYjXh7gqwy', '2026-02-13 02:53:10', '2026-02-13 03:14:00', ''),
(3, 'test3', '11113324', 'test3@gmail.com', '$2b$10$m4uvhY1nTpaL9qIxbiHuwO2iH4C7aeGQgRDQp9XtgdMT6tDpt4Swi', '2026-02-14 03:25:35', '2026-02-14 03:25:35', ''),
(4, 'test2', '21424354363', 'test2@gmail.com', '$2b$10$otXcTHXWpQXO/8j7/vzSiu78v6jUoMgvWTBMFKH57fthgCNf6m6OG', '2026-02-15 08:20:38', '2026-02-15 08:20:38', ''),
(10, 'test5', '2546457', 'test5@gmail.com', '$2b$10$sFywPJiT1MnKSPF5KxAh6e9g2evTIdg4uf4eDkqv0qqsHeAzK5Ffy', '2026-02-18 06:38:56', '2026-02-18 06:38:56', ''),
(11, 'Chang', '', '', '1357', '2026-02-22 09:12:03', '2026-02-22 09:12:03', ''),
(12, 'May', '', 'may@sfdf', '$2b$10$mZTsCrdIY5E06PvY32c13e4cpJ.XFs4xxmKA50.bVAITCm1dgTfz2', '2026-02-23 09:12:00', '2026-02-23 09:12:00', ''),
(13, 'Changgong Hu', '125326574658', 'chang@hotmail', '$2b$10$dBz.inn/1OVwsUh00JlGOe.6krfoiZX0LrrHbr5JA0YmEddyO2NGi', '2026-02-26 08:09:35', '2026-02-26 08:09:35', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`faq_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=260030;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
