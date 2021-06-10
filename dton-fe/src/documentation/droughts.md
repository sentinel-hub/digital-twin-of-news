## Droughts approach
Following is a brief overview of the single processing steps applied to come from an event covered in the news to exact dates, locations and visualizations visible in the app.

#### 1. Finding event date 
The event date returned from event registry is used.

#### 2. Finding the best before and during event visualization dates
To find the best visualization dates NDVI values for the full available timespan (as far back as there are Sentinel-2 images available) are used. First 30-days averages by averaging out the data up to 1 year before the event date (returned from event registry) are calculated and the most recent period before the event date of below average values is set as during event period. For the before event visualization a period with an above average NDVI in the same time of the year as the during event period in the years before is selected. 

In both periods the visualization dates are set as the dates least affected by clouds.

#### 3. Pinpointing the exact location and creating a bounding box
To zoom to the location areas with the biggest difference in NDVI are used. Of those, small features (noise) are removed and features merged into clusters after that small clusters are removed and the remaining clusters are assign scores. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster.