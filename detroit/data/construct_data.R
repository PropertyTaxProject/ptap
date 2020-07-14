#currently this is the best we have...
#https://data.detroitmi.gov/datasets/parcels-2?geometry=-83.754%2C42.264%2C-82.447%2C42.442

file_loc <- "E:/report data/Detroit/Detroit New/open data refresh/Parcels-shp/96caebee-aa31-4840-ad1b-18cf566d6b6e202047-1-vklj93.jb3n9.shp"

library(sf)
library(tidyverse)

parcels <- st_read(file_loc)

parcels <- 
  parcels %>% select(parcel_num, address, zip_code, taxpayer_1,
                   property_c, property_1, use_code_d, tax_status, total_squa,
                   total_acre, frontage, depth, homestead_, total_floo,
                   year_built, assessed_v, taxable_va)

mini <- st_centroid(parcels)

mini_coords <- do.call(rbind, st_geometry(mini)) %>% as_tibble() %>% setNames(c("lon", "lat"))

new <- 
  mini %>% 
  as.data.frame() %>% 
  select(-geometry) %>% 
  mutate(lon = mini_coords$lon, 
         lat = mini_coords$lat) %>%
  filter(property_1 %in% c("RESIDENTIAL"))

new %>% write_csv("detroit/data/detroit_sf.csv")
