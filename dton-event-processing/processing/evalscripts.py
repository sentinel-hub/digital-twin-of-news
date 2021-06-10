wildfire_detection = """
const F1_LIMIT = 350;

function evaluatePixel(samples) {
  if (samples.length === 0) {
    return [0];
  }
  
  const is_very_hot = samples.find(sample => sample.F1 > F1_LIMIT);
  if (is_very_hot) {
    return [1];
  }
  
  return [0];
}

function setup() {
  return {
    input: [{
      bands: [
        "F1",
        "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: {
      bands: 1
    }
  }
}
"""

cloud_mask = """
function evaluatePixel(sample) {
  if(sample.CLM === 1) {
    return [1]
  }
  return [0];
}

function setup() {
  return {
    input: [{
      bands: [
        "CLM"
      ]
    }],
    output: {
      bands: 1
    }
  }
}
"""

volcano_detection = """
const F1_LIMIT = 320;

function evaluatePixel(samples) {
  if (samples.length === 0) {
    return [0];
  }
  
  const is_very_hot = samples.find(sample => sample.F1 > F1_LIMIT);
  if (is_very_hot) {
    return [1];
  }
  
  return [0];
}

function setup() {
  return {
    input: [{
      bands: [
        "F1",
        "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: {
      bands: 1
    }
  }
}
"""

water_detection = """
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [
        "VH", "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: { bands: 1 }
  }
}

function evaluatePixel(samples) {
    const water_threshold = 0.004;

    for(let sample of samples) {
      if (sample.dataMask === 0) {
        continue;
      }
      
      const isPixelWater =  sample.VH < water_threshold;

      if (isPixelWater) {
        return [1]
      }
    }
    return [0]
}
"""


water_mask = """
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [
        "VH", "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: { bands: 1 }
  }
}

function evaluatePixel(samples) {
    const PROBABILITY_CUTOFF = 0.7
    const water_threshold = 0.004;
    let nSamples = 0;
    let nWater = 0
    let noData = true;

    for(let sample of samples) {
      if (sample.dataMask === 0) {
        continue;
      }

      noData = false;

      nSamples++
      
      const isPixelWater =  sample.VH < water_threshold;

      if (isPixelWater) {
        nWater++
      }
    }

    if(noData) {
      // We should ignore the pixels with no data
      return [0]
    }

    if (nWater/nSamples >= PROBABILITY_CUTOFF) {
      return [0];
    }
    return [1]
}
"""

water_mask_s3_olci = """
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [ 
        "B04", "B06", "B08", "B17", "B18", "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: { bands: 1 }
  }
}

// Returns 1 if at least one was classified as water

function evaluatePixel(samples) {
    let allPixelsBad = true;

    for(let sample of samples) {
      if (sample.dataMask === 0) {
        continue;
      }

      const CM  = (sample.B04 - 0.2) / (0.5 - 0.2);
      const NGDR = index(sample.B04, sample.B06);

      if (CM > 0.8 || ( CM > 0 && NGDR > 0.15)) { 
        continue
      }

      allPixelsBad = false

      const VMI3 = (sample.B17 - sample.B08) / (sample.B17 + sample.B08);
      if (VMI3 <= -0.2) {
        return [0]
      }
    }

    if (allPixelsBad) {
      return [0.5]
    }
    return [1]
}
"""


water_detection_s3_olci = """
//VERSION=3
function setup() {
  return {
    input: [{
      bands: [ 
        "B04", "B06", "B08", "B17", "B18", "dataMask"
      ]
    }],
    mosaicking: Mosaicking.ORBIT,
    output: { bands: 1 }
  }
}

// Returns 1 if at least one was classified as water

function evaluatePixel(samples) {
    let allPixelsBad = true;

    for(let sample of samples) {
      if (sample.dataMask === 0) {
        continue;
      }

      const CM  = (sample.B04 - 0.2) / (0.5 - 0.2);
      const NGDR = index(sample.B04, sample.B06);

      if (CM > 0.8 || ( CM > 0 && NGDR > 0.15)) { 
        continue
      }

      allPixelsBad = false

      const VMI3 = (sample.B17 - sample.B08) / (sample.B17 + sample.B08);
      if (VMI3 <= -0.2) {
        return [1]
      }
    }

    if (allPixelsBad) {
      return [0]
    }
    return [0]
}
"""


ndvi_fis_evalscript = """
//VERSION=3
function setup() {
    return {
        input: ["B08", "B04", "CLM"],
        output: {
            bands: 3
        }
    };
}

function evaluatePixel(sample) {
    if (sample.CLM) {
        return [Number.NaN, 1, sample.dataMask]
    }
    const water_cutoff = 0.1
    const ndvi = index(sample.B08, sample.B04)
    if (ndvi <= water_cutoff) {
        return [Number.NaN, 0, sample.dataMask]
    }
    return [ndvi, 0, sample.dataMask];
}
"""


ndvi_evalscript = """
//VERSION=3
function setup() {
  return {
    input: ["B08","B04","CLM","dataMask"],
    output: { bands: 3 }
  };
}

function evaluatePixel(sample) {
  const water_cutoff = 0.1
  const ndvi = index(sample.B08, sample.B04)
  if (ndvi <= water_cutoff) {
      return [0, sample.CLM, sample.dataMask]
  }
  return [(ndvi - water_cutoff)/2, sample.CLM, sample.dataMask];
}
"""


air_pollution_fis_evalscript = (
    lambda product: f"""
//VERSION=3
if (!isFinite({product})) {{
  return [NaN];
}}
return[{product}];
"""
)


air_pollution_image_evalscript = (
    lambda product: f"""
//VERSION=3
function setup() {{
  return {{
    input: ["{product['product']}"],
    output: {{ bands: 1, sampleType: "FLOAT32" }}
  }};
}}
function evaluatePixel(sample) {{
  const change = (sample.{product["product"]} - {product["average"]})/({abs(product["average"])});
  if (change >= {product["cutoff"]} && isFinite(sample.{product["product"]}) && sample.dataMask !== 0) {{
    return [change]
  }}
  return [0];
}}
"""
)
