## Droughts approach
The following is a brief overview of each processing step applied to an event reported in the news to find the exact dates and locations and to display the best visualizations in the app.

#### 1. Finding the exact event date 
The event date returned by Event Registry is used.

#### 2. Finding the best before and during event visualization dates
To find the best visualization dates, NDVI values for the entire available timespan (as far back as Sentinel-2 imagery is available) are used. First, 30-day averages are calculated by averaging the data up to one year before the event date (returned from Event Registry), and the most recent period before the event date with below average values is set as the "during event" period. For the "before event" visualization, a period with an above average NDVI in the same season as the "during event" period in the years before is chosen.

For both periods (before/during the event), the visualization dates are set as the ones least affected by clouds.

#### 3. Pinpointing the exact location and creating a bounding box
To zoom to the location, areas with the largest difference in NDVI are used. From these, small features (noise) are removed and features are merged into clusters, then small clusters are removed and scores are assigned to the remaining clusters. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster.

#### Sources:
- Events: [Event Registry](https://eventregistry.org/)