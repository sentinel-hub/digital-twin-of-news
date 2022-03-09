## Wildfires approach
The following is a brief overview of each processing step applied to an event reported in the news to find the exact dates and locations and to display the best visualizations in the app.

#### 1. Finding the exact event date
To find the correct event date for a wildfire event, the [Forest Fire Information System (EFFIS)](https://effis.jrc.ec.europa.eu/about-effis) is used. The EFFIS is part of the Emergency Management Services in the EU Copernicus program and provides, among other things, a daily updated active fire layer with a resolution of 375 m from VIIRS (more about VIIRS active fire detection [here](https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/active-fire-detection)). To detect the exact event date, the active fire pixels for each day in the 30-day time range before the event date (mentioned in the news article) are counted and the most recent largest increase is set as the event date.

#### 2. Pinpointing the exact location and creating a bounding box
To find the exact location of the fire, the bounding box gets centered to the biggest cluster (group of active fire pixels) in the image of cumulative fire images for the time range (10 days) after the determined exact date (exact date = event date determined in step 1). The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
For each event, the best visualization date before and during/after the event is determined as a combination of tile coverage in the area, cloud coverage, and fire pixels. 

#### Sources:
- EFFIS: © European Union, 2000-2021
- Events: [Event Registry](https://eventregistry.org/)

