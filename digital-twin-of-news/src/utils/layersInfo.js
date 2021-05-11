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
};
