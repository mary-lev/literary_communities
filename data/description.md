### Data Documentation for SPbLitGuide Dataset

#### Overview
The SPbLitGuide dataset originates from a long-running newsletter curated by Daria Sukhovey since May 1999. The newsletter focuses on literary events in St Petersburg and has been regularly updated via email. As of October 2019, the dataset includes 1,157 issues of the newsletter.

#### Data Acquisition
The data was obtained from electronic mail (eml) files uploaded to a WordPress site. The data from the WordPress database was exported to XML format.

#### Data Cleaning and Processing
Initial data cleaning involved the use of regular expressions and the Pandas library to filter out irrelevant sections such as news columns, book reviews, and other literary news. The cleaned data was converted into a CSV format with the following columns:
- **Event Date**: Date and time of the event in naive format, e.g., "05.03.15 четверг 19.00".
- **Event description**: Description of the event in text format.
- **Info Source**: Short description of the source of information about the event, e.g., "соб. инф.".
- **Issue**: Title of the mailing list issue, e.g., "SPbLitGuide 15-03-1".
- **Permalink**: Link to the issue on the website, e.g., "https://isvoe.ru/spblitgid/2015/03/05/spblitguide-15-03-1/".
- **Publication Date**: Date of publication of the issue, e.g., "2015-03-05".

After cleaning, 44,930 records of events were obtained. To address repeated announcements of the same events across different issues, fuzzy matching algorithms were used, resulting in 15,012 unique events.

#### Geocoding and Standardization
The Yandex Geocoder API was used to extract geographic coordinates for addresses. After cleaning and standardizing the addresses, 817 unique addresses with latitude and longitude coordinates were obtained.

#### Person Name Normalization
For the extraction and normalization of Russian names, the DeepPavlov and Natasha libraries were used to handle variations due to grammatical cases and different writing styles. A total of 13,316 unique persons who participated in the events were identified and normalized, and for 2,664 persons, VIAF identifiers were extracted.

#### Participation data
The dataset contains more than 40,000 records of event attendance. Each record represents a relationship between an individual and an event, indicating which individuals attended or were involved in particular literary events. 

#### Resulting Dataset Structure
The final dataset consists of the following components:

- **Events**: 15,012 records ("events.csv")
  - `id`: Unique identifier for the event
  - `description`: Description of the event
  - `date`: Date of the event
  - `address_id`: Identifier linking to the address of the event
  - `place_id`: Identifier linking to the venue of the event
  - `list of person ids`: List of identifiers for persons associated with the event

- **Venues**: 862 records ("places.csv")
  - `id`: Unique identifier for the venue
  - `name`: Name of the venue

- **Addresses**: 817 records ("addresses.csv")
  - `id`: Unique identifier for the address
  - `place_id`: Identifier linking to the venue
  - `place_name`: Name of the place associated with the address
  - `latitude`: Latitude coordinate
  - `longitude`: Longitude coordinate

- **Persons**: 13,316 records ("persons.csv")
  - `id`: Unique identifier for the person
  - `first name`: First name of the person
  - `middle name`: Middle name of the person
  - `last_name`: Last name of the person
  - `pseudonym`: Pseudonym of the person (if any)
  - `viaf_id`: VIAF identifier (if available)
  - `viaf_name`: Name associated with VIAF identifier (if available)
  - `transliterated name`: Name transliterated according to The American Library Association and Library of Congress Romanization Tables for Russian

This dataset provides a comprehensive record of literary events in St Petersburg, capturing details about events, venues, addresses, and participants.
