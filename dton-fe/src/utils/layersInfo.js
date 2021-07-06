export const layersInfo = {
  '3_NDWI': {
    text:
      'The Normalized Difference Water Index shows water in blue and non-water areas in shades of green. The script used is an improvement of the basic script aiming to reduce falsely classified clouds and snow.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/ndwi/#',
        description: 'Custom Script repository',
      },
    ],
  },

  'TRUE-COLOR': {
    text:
      'The true color product maps Sentinel-2 band values B04, B03, and B02 which roughly correspond to red, green, and blue part of the spectrum.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/true_color/#',
        description: 'Custom Script repository',
      },
    ],
  },

  'FLOOD-MAPPING': {
    text:
      'Sentinel-1 data of before and during the flood event combined in one RGB image to highlight more (red color) and less affected areas (black color).',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-1/flood_mapping/',
        description: 'Custom Script repository',
      },
    ],
  },

  'WATER-DETECTION': {
    text:
      'This visualizations uses the Sentinel-1 VH-band to classify water (shown in blue). Non-water pixels are displaying the values of the VH-band.',
    links: [],
  },

  WILDFIRES: {
    text:
      'This visualization shows wildfires using Sentinel-2 data. It combines natural color background with some NIR/SWIR data for smoke penetration and more detail, while adding highlights from B11 and B12 to show fires in red and orange colors.',
    links: [
      {
        href: 'https://pierre-markuse.net/2017/08/07/visualizing-wildfires-sentinel-2-imagery-eo-browser/',
        description: 'Blog post Pierre Markuse',
      },
    ],
  },

  'viirs.hs': {
    text:
      'The VIIRS Active Fires layer displays active fires in blue derived from 375 m resolution data. Compared to the 1000 m resolution of the Sentinel-3 SLSTR F1 band this allows for more precise detection of smaller fires and better outline mapping of bigger fires.',
    links: [
      {
        href: 'https://gwis.jrc.ec.europa.eu/about-gwis/technical-background/active-fire-detection',
        description: 'Active Fire Detection',
      },
    ],
  },

  'HIGH-TEMPERATURE-DETECTION': {
    text:
      'The High Temperature Detection layer uses the Sentinel-3 SLSTR F1 band to identify high temperatures. Pixels above 77 °C are displayed in red indicating potential burning areas, pixels below in a light transparent cyan.',
    links: [],
  },

  'BURNED-AREAS-DETECTION': {
    text:
      'The visualization highlights recently burned areas in red using a combination of different indices (NDVI, NDMI, custom index). Not burned pixels are displayed in a true color visualization.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/burned_area_ms/#',
        description: 'Custom Script repository',
      },
    ],
  },

  'TRUE-COLOR-LAVA-FLOW': {
    text:
      'This visualization enhances the true color visualization by adding the shortwave infrared wavelengths to amplify details. It displays heated areas in red/orange.',
    links: [
      {
        href: 'https://medium.com/sentinel-hub/active-volcanoes-as-seen-from-space-9d1de0133733',
        description: 'Blog post: Active volcanoes from space',
      },
    ],
  },

  '2_MOISTURE-INDEX': {
    text:
      'The moisture index is well suited to monitor droughts. It shows water stress from cyan to red colors with dark red being barren soil. The image on the left side shows the area in a year without drought.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/ndmi/',
        description: 'Custom Script repository',
      },
    ],
  },

  '5_NDVI': {
    text:
      'The Normalized Difference Vegetation Index (NDVI) is a simple, but effective index for quantifying green vegetation. The darker the green color, the denser and healthier the vegetation. Grey color  corresponds to water, ochre color to barren areas of rock, sand, or snow. The image on the left side shows the area in a year without drought.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/ndvi/',
        description: 'Custom Script repository',
      },
    ],
  },

  '6-SWIR': {
    text:
      'The SWIR visualization gives a good estimate of how much water is present in plants and soil. The brighter green the color, the more water. Water bodies such as lakes, rivers and oceans are displayed in black. The image on the left side shows the area in a year without drought.',
    links: [
      {
        href: 'https://custom-scripts.sentinel-hub.com/sentinel-2/composites/',
        description: 'Custom Script repository',
      },
    ],
  },

  'NO2-VISUALISATION': {
    text:
      'This layer shows a 14-day moving average. Using a 14-day average eliminates some effects caused by short-term weather changes and cloud cover, and can be better used to reflect trends. High NO2 levels are often associated with human activities (burning of (fossil) fuels) or wildfires. Longer exposures to elevated concentrations of NO2 may contribute to the development of asthma and potentially increase susceptibility to respiratory infections.',
    links: [
      {
        href: 'https://maps.s5p-pal.com/',
        description: 'Copernicus Sentinel-5P Mapping Portal',
      },
    ],
  },

  AER_AI_340_380: {
    text:
      'The Aerosol Index (AI) is a qualitative index that indicates the presence of elevated layers of aerosols in the atmosphere. It can be used to detect the presence of UV-absorbing aerosols such as desert dust and volcanic ash plumes. High aerosol values have a negative health impact and can cancause amongst others various lung diseases. The AI is calculated for two pairs of wavelengths: 340/380 nm (displayed here) and 354/388 nm.',
    links: [
      {
        href: 'https://sentinel.esa.int/web/sentinel/technical-guides/sentinel-5p/level-2/aerosol-index',
        description: 'Sentinel-5P Aerosol Index',
      },
    ],
  },

  AER_AI_354_388: {
    text:
      'The Aerosol Index (AI) is a qualitative index that indicates the presence of elevated layers of aerosols in the atmosphere. It can be used to detect the presence of UV-absorbing aerosols such as desert dust and volcanic ash plumes. High aerosol values have a negative health impact and can cancause amongst others various lung diseases. The AI is calculated for two pairs of wavelengths: 340/380 nm and 354/388 nm (displayed here).',
    links: [
      {
        href: 'https://sentinel.esa.int/web/sentinel/technical-guides/sentinel-5p/level-2/aerosol-index',
        description: 'Sentinel-5P Aerosol Index',
      },
    ],
  },

  CH4: {
    text:
      'Methane is the most important contributor to the anthropogenic (caused by human activities) enhanced greenhouse effect after carbon dioxide. Measurements are reported in parts per billion (ppb) with a spatial resolution of 7 km x 3.5 km.',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/methane',
        description: 'Tropomi CH4',
      },
    ],
  },

  CO: {
    text:
      'Carbon monoxide (CO) is an important atmospheric trace gas. It is a major air pollutant in certain urban areas. Major sources of CO are fossil fuel combustion, biomass burning, and atmospheric oxidation of methane and other hydrocarbons. The total column of carbon monoxide is measured in mol per square meter (mol/m^2).',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/carbon-monoxide',
        description: 'Tropomi CO',
      },
    ],
  },

  HCHO: {
    text:
      'Long-term satellite observations of tropospheric formaldehyde (HCHO) are essential to support air quality and chemistry-climate related studies from regional to global scale. Seasonal and inter-annual variations in the formaldehyde distribution are mainly related to temperature changes and fire events, but also to changes in anthropogenic (human-induced) activities. Since the lifetime of HCHO is on the order of a few hours, HCHO concentrations in the boundary layer can be directly related to the release of short-lived hydrocarbons, most of which cannot be directly observed from space. Measurements are made in mol per square meter (mol/m^2).',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/formaldehyde',
        description: 'Tropomi HCHO',
      },
    ],
  },

  NO2: {
    text:
      'Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides. They are important trace gases in the Earth´s atmosphere, occurring in both the troposphere and the stratosphere. They enter the atmosphere through anthropogenic activities (especially particularly fossil fuel burning and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). Measurements are made in mol per square metre (mol/m^2).',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/nitrogen-dioxide',
        description: 'Tropomi NO2',
      },
    ],
  },

  O3: {
    text:
      'Ozone is of vital importance to the balance of the earth´s atmosphere. In the stratosphere, the ozone layer shields the biosphere from dangerous solar ultraviolet radiation. In the troposphere, it acts as an efficient cleaning agent, but at high concentrations it also becomes harmful to the health of humans, animals and vegetation. Ozone is also an important greenhouse-gas that contributes contributor to ongoing climate change. Since the discovery of the Antarctic ozone hole in the 1980s and the subsequent Montreal Protocol, which regulates the production of chlorine-containing ozone-depleting substances, ozone is routinely monitored from the ground and from space. Measurements are made in mol per square metre (mol/m^2)',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/total-ozone-column',
        description: 'Tropomi O3',
      },
    ],
  },

  SO2: {
    text:
      'Sulphur dioxide enters the Earth´s atmosphere through both natural and anthropogenic (man-made) processes. It plays a role in chemistry on both a local and a global scale and its effects range from short-term pollution to climate impacts. Only about 30% of emitted SO2 comes from natural sources; the majority is of anthropogenic origin. Measurements are made in mol per square metre (mol/m^2).',
    links: [
      {
        href: 'http://www.tropomi.eu/data-products/sulphur-dioxide',
        description: 'Tropomi SO2',
      },
    ],
  },
};
