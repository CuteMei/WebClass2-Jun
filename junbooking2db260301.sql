-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Mar 01, 2026 at 09:32 AM
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
(260001, 2, '2026-03-09', '09:30:00', 'First visit - back pain', '2026-02-27 02:38:16', '2026-02-27 02:38:16'),
(260002, 2, '2026-03-13', '09:30:00', 'Follow-up treatment', '2026-02-27 02:44:51', '2026-02-27 02:44:51'),
(260003, 2, '2026-03-17', '13:00:00', 'Follow-up treatment', '2026-02-27 04:36:34', '2026-02-27 04:36:34'),
(260005, 2, '2026-03-16', '14:30:00', 'First visit - shoulder pain', '2026-02-27 06:13:01', '2026-02-27 08:40:44'),
(260006, 4, '2026-03-17', '16:00:00', 'Monthly maintenance', '2026-02-27 06:18:25', '2026-02-27 06:18:25'),
(260007, 5, '2026-03-17', '09:30:00', 'Stress relief', '2026-02-27 06:22:58', '2026-02-27 06:22:58'),
(260009, 6, '2026-03-17', '11:00:00', 'First visit - back pain', '2026-02-27 07:16:53', '2026-02-27 07:16:53'),
(260010, 3, '2026-03-17', '14:30:00', 'Monthly Check', '2026-02-27 08:42:42', '2026-02-27 08:42:42');

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
(1, 'Jun Wu', '0211234567', 'admin@jhh.com', '$2b$10$NykCIItuCDTjpikcJw1Rneu9vsCF21G.aPBMO/O1OAhAlOiwUDq3e', '2026-02-27 02:04:07', '2026-02-27 02:21:21', 'admin'),
(2, 'Mei Qiu', '027230888', 'mqiu@gmail.com', '$2b$10$QSn3STY9VwIlr23G8eu9Wux55zqxm66Ib2MVtCFC5V9p4tuj301WS', '2026-02-27 02:24:37', '2026-02-28 22:47:14', ''),
(3, 'Sarah Chen', '0212345678', 'sarah.c@gmail.com', '$2b$10$.QOCDRMMOSa34WI5JQd7suluUtDIOO9Bp9ZBgwqwNDhSFImvNrf0q', '2026-02-27 04:57:53', '2026-02-27 04:57:53', ''),
(4, 'Maria Garcia', '0223456789', 'maria.g@outlook.com', '$2b$10$jQVmfBPABUiMySafWGAkxO8JSOb2UUsYmPCfwteO5EoY7D3/tuv26', '2026-02-27 06:10:48', '2026-02-27 06:10:48', ''),
(5, 'Emma Wilson', '0234567890', 'emma.w@yahoo.com', '$2b$10$owc3K.A1mzTG7y.judu6fugAMp8HFTk3cUuClM2Cc1X6EGg8DWtuG', '2026-02-27 06:21:28', '2026-02-27 06:21:28', ''),
(6, 'Lisa Patel', '0245678901', 'lisa.p@gmail.com', '$2b$10$lXfGjcJO4mBRfnAYVBwP3uMBwe4uGrN07JhSKCOf2sC2eDYHntXMq', '2026-02-27 06:26:09', '2026-02-27 06:26:09', ''),
(7, 'May Chen', '32543658', 'mc@hotmail.com', '$2b$10$DQQDRFvUD7Psu87cbgDnsOu8c3yLDlxVIVHN.urJq0KI3SSLfnkce', '2026-02-27 08:48:38', '2026-02-27 08:49:50', ''),
(8, 'Jess Hu', '3474895736', 'jess@sgrtgdgd', '$2b$10$Ud1lA0nKHFJkvXwD.owOou8nDoT1CyuQl02kpMvj7rPZRbixvcdea', '2026-02-28 22:52:13', '2026-02-28 22:52:13', '');

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
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=260011;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `faq_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
