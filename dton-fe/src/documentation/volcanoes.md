## Volcanoes approach
The following is a brief overview of each processing step applied to an event reported in the news to find the exact dates and locations and to display the best visualizations in the app.

#### 1. Finding the exact event date
To find the correct event date, Sentinel-3 SLSTR is used. Hot-pixels (a pixel is considered hot if it is above 46.8 °C) are counted in a bounding box that covers the location provided by Event Registry. The largest increase in the time range (30 days) before the event date (returned by Event Registry) is set as the event date.

#### 2. Pinpointing the exact location and creating a bounding box
In the first step, the concepts of the event returned by Event Registry are checked. For all concepts of type _location_, the lat/lng and type of the location is determined via the MediaWiki API. The highest ranked concept with the type _mountain_ is set as location and the lat/lng returned by Wikipedia is used as the event location.

If the event has no concept of type _location_ with type _mountain_, the same approach as for wildfires is used, which looks for the largest hot-pixel cluster in images for the time range (10 days) after the determined exact date (exact date = event date determined in step 1). The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
For each event, the best visualization date before and during/after the event is determined as a combination of tile coverage and cloud coverage in the area.

#### Sources:                  
- Wikipedia: [Category Mountains](https://en.wikipedia.org/wiki/Category:Mountains) 
- Events: [Event Registry](https://eventregistry.org/)

