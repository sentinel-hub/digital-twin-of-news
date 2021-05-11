## Volcanoes approach
Following is a brief overview of the single processing steps applied to come from an event covered in the news to exact dates, locations and visualizations visible in the app.

#### 1. Finding the event date 
To find the correct event date Sentinel-3 SLSTR is used. In a bounding box around the location provided by event registry hot-pixels (a pixel is considered as hot if it's above 46.8 °C) are counted and the biggest increase in the time range (30 days) before the event date (returned from event registry) is set as event date.

#### 2. Pinpointing the exact location and creating a bounding box
In the first step the concepts of the event returned by event registry are checked. For all concepts of the type location the lat/lng and the type of the location is determined using the MediaWiki API. The hightest ranked concept with type mountain is set as location and the lat/lng returned from Wikipedia is used as event location.

If the event has no concept of type mountain the same approach as for wildfires is used which searches for the biggest hot-pixel cluster in images for the time range (10 days) after the determined exact date (exact date = event date determined in step 1). The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
For each event the best visualization date before and during/after the event is determined as a combination of tile coverage and cloud coverage in the area.

#### Sources:                  
- Wikipedia: [Category Mountains](https://en.wikipedia.org/wiki/Category:Mountains) 
- Events: [Event Registry](https://eventregistry.org/)

