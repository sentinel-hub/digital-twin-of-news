## Floods approach
The following is a brief overview of each processing step applied to an event reported in the news to find the exact dates and locations and to display the best visualizations in the app.

#### 1. Finding the exact event date 
For floods, the event date returned by Event Registry is sufficient, since floods are usually phenomena that last at least several days.

#### 2. Pinpointing the exact location and creating a bounding box
To find flood locations, a water mask before the event and a water mask during the event is calculated and compared.

The "before event" water mask is created using Sentinel-1 and Sentinel-3 OLCI. For Sentinel-1, it is created as an aggregation of water pixels over 30 days in the time period 45 – 15 days before the event (a pixel is classified as water if it was classified as water in >70% of the images used). With Sentinel-3, pixel with clouds in the images are removed first and if a pixel was classified as water at least once after that it is included in the water mask. In general, the water mask created with Sentinel-1 data is used, because it is not affected by clouds. However, if the difference between the two masks is too large, this is often a sign of a misclassification in the Sentinel-1 water pixels (e.g. as sand) and in these cases the Sentinel-3 water mask is used.

The during the event water mask is created as an aggregation of water pixels over 15 days prior to the event date (returned by Event Registry), since the flooding is assumed to occur during these 15 days. All pixels during this period that have been classified as water at least once are included.

The difference of the two masks (before and during the event) is used for the localization. On the difference image, small features (noise) are removed and remaining features are merged into clusters. Then small clusters are removed and scores are assigned to the remaining clusters. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster.

#### 3. Finding the best tile(s) for the visualizations
The same approach is used for Sentinel-1 imagery (water masks) and Sentinel-2 imagery (True color, NDWI). For the "before event" image, the best cloud-free image in the time span from 50 days before the event date to 7 days before the event date (from Event Registry) is used. Such a long-time span is necessary to find cloud-free images because flood events are often caused by severe storms over a long period of time with many clouds. The image during the event is the best cloud-free image in the time span 7 days before the event date (from Event Registry) to 20 days (for Sentinel-1, 40 days for Sentinel-2) later.

#### Sources:
- Events: [Event Registry](https://eventregistry.org/)