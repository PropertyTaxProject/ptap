// eslint-disable-next-line
export function getMinComparables(region) {
  if (region === "detroit") {
    return 1
  } else if (region === "milwaukee") {
    return 3
  } else {
    return 5
  }
}

// eslint-disable-next-line
export function getMaxComparables(region) {
  return region === "detroit" ? 1 : 5
}

export function getPageLabel(pageName, { region }) {
  let pages = []
  if (["cook", "detroit"].includes(region)) {
    pages = [
      "appeal-lookup",
      "homeowner-info",
      "review-property",
      "review-comparables",
      "damage",
      "review-appeal",
    ]
  } else {
    let agreementPage = []
    if (region === "milwaukee") {
      agreementPage = ["mke-agreement"]
    }
    pages = [
      "appeal-lookup",
      "homeowner-info",
      ...agreementPage,
      "review-property",
      "review-comparables",
      "damage",
      "review-appeal",
    ]
  }
  return `Page ${pages.indexOf(pageName) + 1} of ${pages.length}`
}

export function getProjectConfig(region) {
  const defaultConfig = {
    showComparables: true,
    economicObsolescense: false,
    hopeExemption: false,
    includeDamageLevel: false,
  }
  if (region === "detroit") {
    return {
      ...defaultConfig,
      includeDamageLevel: true,
      economicObsolescense: true,
      hopeExemption: true,
    }
  } else if (region === "milwaukee") {
    return defaultConfig
  } else {
    return defaultConfig
  }
}

export const HELP_LINK = "https://calendly.com/stopforeclosuremke/appealhelp"

export const CONTACT_EMAIL = "stoptaxforeclosure@communityadvocates.net"

export const DISPLAY_FIELDS = [
  {
    title: "Address",
    field: "address",
  },
  {
    title: "Sale Price",
    field: "sale_price",
  },
  {
    title: "Sale Date",
    field: "sale_date",
  },
  {
    title: "Year built",
    field: "year_built",
  },
  {
    title: "Building Sq Ft.",
    field: "building_sq_ft",
  },
  {
    title: "Exterior",
    field: "exterior",
  },
  {
    title: "Baths",
    field: "baths",
  },
  {
    title: "Stories",
    field: "stories",
  },
  {
    title: "Garage",
    field: "garage",
  },
]

export const DISPLAY_FIELDS_COOK = [
  {
    title: "Address",
    field: "address",
  },
  {
    title: "Year built",
    field: "year_built",
  },
  {
    title: "Basement",
    field: "basement",
  },
  {
    title: "Beds",
    field: "bedrooms",
  },
  {
    title: "Building Sq Ft.",
    field: "building_sq_ft",
  },
  {
    title: "Land Sq Ft.",
    field: "land_sq_ft",
  },
  {
    title: "Class",
    field: "property_class",
  },
  {
    title: "Exterior",
    field: "exterior",
  },
  {
    title: "Garage",
    field: "garage",
  },
  {
    title: "Rooms",
    field: "rooms",
  },
  {
    title: "Stories",
    field: "stories",
  },
  {
    title: "Assessed Value",
    field: "assessed_value",
  },
  {
    title: "Distance",
    field: "distance",
  },
]

export const DISPLAY_FIELDS_MKE = [
  {
    title: "Address",
    field: "address",
  },
  {
    title: "Year built",
    field: "year_built",
  },
  {
    title: "Baths",
    field: "baths",
  },
  {
    title: "Bedrooms",
    field: "bedrooms",
  },
  {
    title: "Building style",
    field: "building_type",
  },
  {
    title: "Physical condition",
    field: "condition",
  },
  {
    title: "Distance",
    field: "distance",
  },
  {
    title: "Neighborhood",
    field: "neighborhood",
  },
  {
    title: "Total Sq Ft.",
    field: "total_sq_ft",
  },
  {
    title: "Assessed Value Tentative",
    field: "assessed_value",
  },
  {
    title: "Sale Price",
    field: "sale_price",
  },
  {
    title: "Sale Date",
    field: "sale_date",
  },
  {
    title: "Sale Validity",
    field: "sale_validity",
  },
]

export function getDisplayFields(region) {
  if (region === "cook") {
    return DISPLAY_FIELDS_COOK
  } else if (region === "milwaukee") {
    return DISPLAY_FIELDS_MKE
  }
  return DISPLAY_FIELDS
}

export const DETROIT_PHONE = "313-438-8698"
