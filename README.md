# IGR204 Project
# Telecom ParisTech

### Students:
* Vincent Bisogno
* Vincent Gaillard
* Roman Fenioux
* Ronan Desplanques

### Getting started
* Create a folder named "data" at the project root
* Download this data file (database.csv) : https://www.kaggle.com/murderaccountability/homicide-reports
* Rename it "homicides.csv" and move it to "data" folder
* Download "us.1990_2015.19ages.adjusted.gz" (not the .exe) : https://seer.cancer.gov/popdata/yr1990_2015.19ages/us.1990_2015.19ages.adjusted.txt.gz (from https://seer.cancer.gov/popdata/download.html)
* Uncompress it : tar -zxvf us.1990_2015.19ages.adjusted.gz
* Rename it in: us_pop.txt and put it in the 'data' directory
* Go to "compute_data" folder and execute the makefile : make
* Open "index.html" WARNING : Do not work with chrome in local (firefox works well)

### Dataset main informations:
* agency code, name and type
* state and city
* year and date
* crime type
* weapon
* solved
* victim sex, age, race
* perpetrator sex, age, race
* relationship
