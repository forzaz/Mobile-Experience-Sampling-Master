-- phpMyAdmin SQL Dump
-- version 4.7.9
-- https://www.phpmyadmin.net/
--
-- Host: ExperienceSampler.db
-- Generation Time: Apr 02, 2018 at 10:31 PM
-- Server version: 10.2.10-MariaDB-10.2.10+maria~xenial
-- PHP Version: 7.1.11-nfsn1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ExperienceSampler`
--

-- --------------------------------------------------------

--
-- Table structure for table `Answers`
--

CREATE TABLE `Answers` (
  `Qid` int(11) NOT NULL,
  `Rid` int(11) NOT NULL,
  `Value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Messages`
--

CREATE TABLE `Messages` (
  `Mid` int(11) NOT NULL,
  `Date` timestamp NULL DEFAULT NULL,
  `Content` text NOT NULL,
  `Uid` int(11) DEFAULT NULL COMMENT 'Optional, if this message is intended for all users.',
  `AllUsers` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Set to ''1'' to make this message appear for all users.',
  `RetrievedBy` text DEFAULT NULL,
  `ReadBy` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Notifications`
--

CREATE TABLE `Notifications` (
  `Uid` int(11) NOT NULL,
  `Did` int(11) NOT NULL,
  `Sid` int(11) NOT NULL,
  `Date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Questions`
--

CREATE TABLE `Questions` (
  `Qid` int(11) NOT NULL,
  `Qname` varchar(60) NOT NULL,
  `Question` varchar(255) NOT NULL,
  `Type` varchar(255) NOT NULL DEFAULT 'ShortText',
  `Labels` varchar(255) NOT NULL,
  `Required` tinyint(1) NOT NULL DEFAULT 0,
  `Frequency` varchar(60) NOT NULL DEFAULT 'ESM',
  `Page` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Questions`
--

INSERT INTO `Questions` (`Qid`, `Qname`, `Question`, `Type`, `Labels`, `Required`, `Frequency`, `Page`) VALUES
(1, 'Year', '2018 is the year of ____?\r\n', 'Select', 'Mouse;Dog;Tiger;Rooster', 1, 'ESM', 1),
(2, 'FirstStudy', 'In which year the 1st experience sampling study was published?\r\n', 'ShortText', '', 1, 'ESM', 1),
(3, 'Subscription', 'Which subscription do I need to choose for a design of 150 (ppm) * 7 (day) * 8 (session) * 20 (question)?\r\n', 'Select', 'Free;Student;Basic;Gold;Platinum', 1, 'ESM', 1),
(4, 'Birthday', 'What is your birthday?', 'Date', 'text', 1, 'ESM', 2),
(5, 'Dinner', 'What time do you usually eat dinner?', 'Time', '', 1, 'ESM', 2),
(6, 'Number', 'Select a number below 50.', 'Slider', '0<75<100', 1, 'ESM', 2),
(7, 'Photo', 'Please take a photo', 'Photo', '', 1, 'ESM', 3),
(8, 'ShareLocation', 'Please, agree with sharing your location.', 'ShareLocation', '', 1, 'ESM', 4),
(9, 'Voice', 'Make a cow sound', 'Recording', '', 1, 'ESM', 5),
(10, 'ChooseLocation', 'Mark the city where you were born.', 'ChooseLocation', '', 1, 'ESM', 6);

-- --------------------------------------------------------

--
-- Table structure for table `Responses`
--

CREATE TABLE `Responses` (
  `Rid` int(11) NOT NULL,
  `Uid` int(11) NOT NULL,
  `StartDate` datetime NOT NULL,
  `EndDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Setup`
--

CREATE TABLE `Setup` (
  `Qid` int(11) NOT NULL,
  `Qname` varchar(60) NOT NULL,
  `Question` varchar(255) NOT NULL,
  `Type` varchar(60) NOT NULL DEFAULT 'ShortText',
  `Labels` varchar(255) NOT NULL,
  `Required` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Setup`
--

INSERT INTO `Setup` (`Qid`, `Qname`, `Question`, `Type`, `Labels`, `Required`) VALUES
(1, 'Age', 'Age\r\n', 'ShortText', '', 1),
(2, 'Gender', 'Gender\r\n', 'Dropdown', 'Make;Female', 1),
(3, 'WakeupWeekday', 'When do you normally wake up on weekdays?', 'Time', '', 1),
(4, 'SleepWeekday', 'When do you normally sleep on weekdays?', 'Time', '', 1),
(5, 'WakeupWeekend', 'When do you normally wake up in the weekends?', 'Time', '', 1),
(6, 'SleepWeekend', 'When do you normally sleep in the weekends?', 'Time', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `Uid` int(11) NOT NULL,
  `Username` varchar(20) NOT NULL,
  `Email` varchar(60) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Tmp` tinyint(1) NOT NULL DEFAULT 0,
  `Token` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Answers`
--
ALTER TABLE `Answers`
  ADD KEY `Answers_fk0` (`Qid`),
  ADD KEY `Answers_fk1` (`Rid`);

--
-- Indexes for table `Messages`
--
ALTER TABLE `Messages`
  ADD PRIMARY KEY (`Mid`),
  ADD UNIQUE KEY `Uid` (`Uid`);

--
-- Indexes for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD KEY `Notifications_fk0` (`Uid`);

--
-- Indexes for table `Questions`
--
ALTER TABLE `Questions`
  ADD PRIMARY KEY (`Qid`);

--
-- Indexes for table `Responses`
--
ALTER TABLE `Responses`
  ADD PRIMARY KEY (`Rid`),
  ADD KEY `Responses_fk0` (`Uid`);

--
-- Indexes for table `Setup`
--
ALTER TABLE `Setup`
  ADD PRIMARY KEY (`Qid`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`Uid`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Messages`
--
ALTER TABLE `Messages`
  MODIFY `Mid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Questions`
--
ALTER TABLE `Questions`
  MODIFY `Qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Responses`
--
ALTER TABLE `Responses`
  MODIFY `Rid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Setup`
--
ALTER TABLE `Setup`
  MODIFY `Qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `Uid` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Answers`
--
ALTER TABLE `Answers`
  ADD CONSTRAINT `Answers_fk0` FOREIGN KEY (`Qid`) REFERENCES `Questions` (`Qid`),
  ADD CONSTRAINT `Answers_fk1` FOREIGN KEY (`Rid`) REFERENCES `Responses` (`Rid`);

--
-- Constraints for table `Messages`
--
ALTER TABLE `Messages`
  ADD CONSTRAINT `Messages_fk0` FOREIGN KEY (`Uid`) REFERENCES `Users` (`Uid`);

--
-- Constraints for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD CONSTRAINT `Notifications_fk0` FOREIGN KEY (`Uid`) REFERENCES `Users` (`Uid`);

--
-- Constraints for table `Responses`
--
ALTER TABLE `Responses`
  ADD CONSTRAINT `Responses_fk0` FOREIGN KEY (`Uid`) REFERENCES `Users` (`Uid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
