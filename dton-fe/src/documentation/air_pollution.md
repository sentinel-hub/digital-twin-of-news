## Air Pollution approach
The following is a brief overview of each processing step applied to an event reported in the news to find the exact dates and locations and to display the best visualizations in the app.

#### 1. Finding products that show air pollution in the area 
To find possible air pollution, different products (CO, HCHO, NO2, O3, SO2, CH4, two aerosol indices) provided by Sentinel-5P are used. To determine which product indicates pollution in the area, a 30-day average is compared to the maximum value for the 5 days prior to the event date (returned from Event Registry). To eliminate noise, a 3-day average is applied to the 5 days prior to the event using a moving window. A product indicates air pollution if the increase before the event (5-day maximum compared to the 30-day average) is significant (>70 %).

#### 2. Pinpointing the exact location and creating a bounding box
For all products with significant change, the relative increase for each pixel is combined into one image (the increase is considered when the difference between the average and maximum is >60 %). This image is used to pinpoint the exact location by removing small features (noise) and combining features into clusters. Small clusters are then removed and scores are assigned to the remaining clusters. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best visualization dates
Visualization dates are set separately for each product and only for those products that have significant change (see step 1). To set the "before the event" visualization date, the dates in the 30-day time-range before the event are evaluated, and the one with the minimum value (using a 3-day moving window) is selected. The "during event date" is the date determined in step 1 with the maximum in the 5 days before the event date.

#### Sources:
- Events: [Event Registry](https://eventregistry.org/)