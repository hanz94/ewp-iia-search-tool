
# EWP IIA Search Tool

EWP IIA Search Tool (fullstack React-based application) is designed for the staff and students of The John Paul II Catholic University of Lublin (KUL) and enables the visitors to search and view the details of Inter-Institutional Agreements (IIAs) signed between KUL and its Erasmus+ partner institutions based on the data from [EWP Dashboard](https://ewp-dashboard.eu/) platform.

Implementation: https://www.kul.pl/art_110162.html

## How it works

The application facilitates finding IIA details by integrating 2 modules, each using a different database:

➡ CSV Module (with local database) - offers static data from regularly updated downloadable spreadsheet (CSV converted to XLSX by [ExcelSQL](https://github.com/hanz94/excelsql)),

➡ EWP Module (with remote database) - offers real-time data from [EWP Dashboard](https://ewp-dashboard.eu/) platform.

## Preview

### Local database (XLSX File)

| | |
|:-------------------------:|:-------------------------:|
|<img width="717" alt="CSV Module Preview (PNG-1)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/b57d7cd9d4170e8f26f82bd52baf9be4cc4768c0/screenshots/csv-1.png">|<img width="717" alt="CSV Module Preview (PNG-2)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/b57d7cd9d4170e8f26f82bd52baf9be4cc4768c0/screenshots/csv-2.png">|


### Remote database (EWP Dashboard API)

| | |
|:-------------------------:|:-------------------------:|
|<img width="717" alt="EWP Module Preview (PNG-1)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/130de66a4aaac04955a06c29fb11ca6a9541d8e4/screenshots/ewp-1.png">|<img width="717" alt="EWP Module Preview (PNG-2)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/130de66a4aaac04955a06c29fb11ca6a9541d8e4/screenshots/ewp-2.png">|
|<img width="717" alt="EWP Module Preview (PNG-3)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/130de66a4aaac04955a06c29fb11ca6a9541d8e4/screenshots/ewp-3.png">|<img width="717" alt="EWP Module Preview (PNG-4)" src="https://github.com/hanz94/ewp-iia-search-tool/blob/130de66a4aaac04955a06c29fb11ca6a9541d8e4/screenshots/ewp-4.png">|

# Acknowledgements
- Arkadiusz Włodarczyk for inspiring courses on:
    - [JS, XML, jQuery, AJAX and RWD](https://www.udemy.com/course/kurs-tworzenia-stron-www-w-html-i-css-od-podstaw-do-eksperta/ )
    - [React Hooks, framer-motion, PWA](https://www.udemy.com/course/react-od-podstaw-do-eksperta/)
