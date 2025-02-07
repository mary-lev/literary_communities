# Computational Analysis of Literary Communities: Event-Based Social Network Study of St. Petersburg 1999-2019

This repository contains an anonymized dataset accompanying a paper under review. The data covers literary events in St. Petersburg from 1999 to 2019, based on the SPbLitGuide newsletter archive.

🔗 **Interactive Visualization**: [literary-communities.vercel.app](https://literary-communities.vercel.app/)

## Repository Structure

### /data
- `cooccurrence_list_fraction.json`: Network co-occurrence data
- `events_with_al_tags.csv`: Events with AI-tags
- `events_with_tags.csv`: Events with manual tags
- `events.csv`: Primary event data
- `persons.csv`: Participant data
- `places.csv`: Location data
- `spb_venues_classified.csv`: Classified venue information
- `description.md`: Detailed data description

### /src
- `App.js`: Main application component
- `CommunityDetail.js`: Community analysis visualization
- `CommunityEvolution.js`: Temporal community analysis
- `EventType.js`: Event type visualization
- `Timeline.js`: Temporal visualization
- `reportWebVitals.js`: Performance metrics

## Dataset Overview

The dataset documents:
- 15,012 cultural events
- 11,777 unique participants
- 862 venues
- Period: 1999-2019

## License

This dataset is released under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Acknowledgments

The dataset is based on the SPbLitGuide newsletter maintained by Darya Sukhovey. 

## Contact

For questions about the dataset, please open an issue in this repository.