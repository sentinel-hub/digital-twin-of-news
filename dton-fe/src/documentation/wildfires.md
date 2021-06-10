## Wildfires approach
Following is a brief overview of the single processing steps applied to come from an event covered in the news to exact dates, locations and visualizations visible in the app.

#### 1. Finding the event date 
To find the correct event date the European [Forest Fire Information System (EFFIS)](https://effis.jrc.ec.europa.eu/about-effis) is used. EFFIS is part of the Emergency Management Services in the EU Copernicus program and provides amongst others a daily update active fire layer with a 375 m resolution from VIIRS (more about the VIIRS active fire detection [here](https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/active-fire-detection)). To detect the exact event date the active fire pixels for every day in the time range (30 days) before the event date (returned from event registry) are counted and the most recent biggest increase is set as event date.

#### 2. Pinpointing the exact location and creating a bounding box
To find the exact location of the fire the bounding box gets cantered to the biggest cluster in the image of cumulative fire images for the time range (10 days) after the determined exact date (exact date = event date determined in step 1). The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
For each event the best visualization date before and during/after the event is determined as a combination of tile coverage in the area, cloud cover and fire pixel.

#### Sources:                  
- EFFIS: © European Union, 2000-2021
- Events: [Event Registry](https://eventregistry.org/)

