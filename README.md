# SampleU – An Open Source Experience Sampling and Ecological Momentary Intervention App for Android and iOS
This mobile application and backend interface allows researchers to conduct experience sampling or ecological momentary intervention studies. The app works on both Android and iOS platforms.

This project is led by Chao Zhang, Daniël Lakens, and Karin Smolders from Human-Technology Interaction group at Eindhoven University of Technology (https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/). 

The development of the app, including the design and coding of the front and back-end, was greatly helped by BOSONIC.design http://www.bosonic.design/

### Features of the current version (1.0.2)
* Cordova-based; developing for Android and iOS by using only HTML, JavaScript, and CSS
* Data are stored in MySQL database on your own server; privacy is fully protected as you control all your data; avoid violations with General Data Protection Regulation (GDPR) (EU)
* Questionnaire design can be done through manipulation of the database (with GUI, e.g., phpMyAdmin or Adminer)
* Support most common questionnaire types (e.g., Likert scale, slider, time-picker, text, etc.), but also taking photos, recording voices, and sharing geolocations
* Flexible scheduling of notifications (time or signal contingent) can be done by coding in JavaScript
* Messaging system using Firebase; ability to send reminders or other intervention contents to participants
* One script to transform tables from your database to csv format for analyses in R, Python, SPSS, or Stata

### Documentation and tutorial
For now, you can refer to the documentation.pdf for instructions about how to customize and setup the app. We are working on a more researcher-friendly tutorial.

If you have any questions, please contact chao.zhang87@gmail.com
