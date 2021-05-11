## Floods approach
Following is a brief overview of the single processing steps applied to come from an event covered in the news to exact dates, locations and visualizations visible in the app.

#### 1. Finding the event date 
For floods the event date returned from event registry is sufficient as floods are usually phenomena that last at least several days.

#### 2. Pinpointing the exact location and creating a bounding box
To find flood locations the difference of a before event water mask and a during event water mask is calculated and compared.

The before event water mask is created using Sentinel-1 and Sentinel-3 OLCI. For Sentinel-1 it is created as aggregation of water pixels over 30 days in the time period 45 – 15 days before the event (a pixel is classified as water if it was classified as water in >70% of the used images). For Sentinel-3 first pixel with clouds in the images get removed and if a pixel is afterwards at least once classified as water it will be included in the water mask.
In general, the water mask created using Sentinel-1 is used, as it's not affected by clouds. If, however the difference between both masks is too great it's often a sign for false classification so Sentinel-1 water pixels (e.g. as sand) and in those cases the Sentinel-3 water mask is used. 

The during event water mask is created as aggregation of water pixels over 15 days before the event date (returned by event registry) as it's assumed the flooding to place in those 15 days. All pixels in that period that are classified as water at least once are considered. 

To pinpoint the location the difference of both masks (before and during the event) is used. On the difference image small features (noise) are removed and features merged into clusters. Afterwards small clusters are removed and the remaining clusters are assigned scores. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
The same approach for Sentinel-1 images (water masks) and Sentinel-2 images (True color, NDWI) is used. For the before event image the best cloud free image in time span 50 days before event date to 7 days before the event date (from event registry) is used. Such a long-time span is necessary to find cloud free images as flood events are often caused by heavy storms over a longer period with a lot of clouds. The during event image is the best cloud free image in the time span 7 days before the event date (from event registry) until 20 days (for Sentinel-1, 40 days for Sentinel2) later.