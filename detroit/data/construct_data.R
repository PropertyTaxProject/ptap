#currently this is the best we have...
#https://data.detroitmi.gov/datasets/parcels-2?geometry=-83.754%2C42.264%2C-82.447%2C42.442

file_loc <- "E:/report data/Detroit/Detroit New/open data refresh/Parcels-shp/96caebee-aa31-4840-ad1b-18cf566d6b6e202047-1-vklj93.jb3n9.shp"

library(sf)
library(tidyverse)
library(data.table)

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

new <- new %>% arrange(parcel_num, assessed_v) %>% distinct(parcel_num, .keep_all=TRUE)

valsales <- fread("E:/report data/Detroit/Processed/val_sales20.csv", colClasses = "character") %>% filter(`Property Class` == 401)

valsales_mini <- valsales %>% arrange(-as.numeric(`SALE_YEAR`)) %>% distinct(`Parcel Number`, .keep_all = TRUE)
joined <- new %>% left_join(valsales_mini, by=c("address" = "Street Address"))


mini <- joined %>% select(parcel_num:lat, `Sale Date`, Neighborhood, `Sale Price`, `Asd. when Sold`, `$/Sq.Ft.`, SALE_YEAR)

mini <- mini %>% rename("Longitude" = lon,
                        "Latitude" = lat)

mini %>% write_csv("detroit/data/detroit_sf.csv")

library(tidyverse)
library(haven)

tst <- read_dta("~/../Downloads/bsna_to_mls.dta")
tst3 <- read_csv("~/../Downloads/parcel_data_latest.csv")
tst4 <- read_dta("~/../Downloads/target_prep.dta")


bsna <- read_dta("~/../Downloads/bsna.dta")


bsna_mini <- bsna %>% select(parcelnum, address_geo, zip_geo, geometry, generaltaxinfo_propertyclass,
                       sqft, acres, yearbuilt, height_bba, garage_has,  basement_has, exteriorcat,
                       bathcat, owner, ownocc, sev)

bsna_mini <- 
  bsna_mini %>% mutate(heightcat = case_when(height_bba %in% c("1    Story", "1.25 Story", "1.5  Story", "1+   Story") ~ 1,
                                      height_bba %in% c("2    Story", "1.75 Story", "2.5  Story", "Bi-Level") ~ 2,
                                      height_bba %in% c("3    Story", "Tri-Level", "3.5  Story") ~ 3,
                                      TRUE ~ -1)) %>%
  select(-height_bba)

bsna_mini <- 
  bsna_mini %>%
  mutate(geometry = str_replace_all(geometry, "c|\\(|\\)", "")) %>%
  separate(geometry, sep=",", c("lon", "lat"), convert=TRUE)


#exteriorcat (1 siding, 2 brick/other, 3 brick, 4 other)
#bathcat (1 1.0, 2 1.5, 3 2 to 3, 4 3+)
#heightcat (1 1 to 1.5, 2 1.5 to 2.5, 3 3+)

write_csv(bsna_mini, "detroit/data/detroit_sf2.csv")
