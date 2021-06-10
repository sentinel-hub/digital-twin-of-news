## Air Pollution approach
Following is a brief overview of the single processing steps applied to come from an event covered in the news to exact dates, locations and visualizations visible in the app.

#### 1. Finding products that show pollution in the area 
To find possible air pollution different products (CO, HCHO, NO2, O3, SO2, CH4, two Aerosol indices) provided by Sentinel-5P are used. To determine which product shows the pollution in the area a 30-day mean is compared with the maximum value of the 5 days before the event date (returned from event registry). To cancel noise a 3-day average using a moving window is applied on the 5 days. A product is considered to show air pollution if the increase before the event (5 days maximum compared to 30-day average) is significant (>70 %).

#### 2. Pinpointing the exact location and creating a bounding box
For all products with significant change the relative increase for each pixel is merged into one image (the increase is considered if the difference between average and maximum is >60 %). This image is used to pinpoint the exact location by removing small features (noise) and merging features into clusters. Afterwards small clusters are removed and the remaining clusters are assign scores. The cluster with the highest score represents the location. The size of the bounding box is calculated to cover the cluster. 

#### 3. Finding the best visualization dates
The visualization dates are set for each product separately and only for those products that show significant change (see step 1). To set the date for the before event visualization the date of the minimum in the 30 days (using a 3-day moving window) before the event date is used. The during event date is the in step 1 determined date with the maximum in the 5 days before the event date.