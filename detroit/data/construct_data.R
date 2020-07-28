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


bsna_original <- fread("~/../Downloads/parcel_data_latest.csv")
bsna_mini <- 
  bsna_original %>% select(`Parcel ID`, Address, `Garage Information _ Area`, 
                           `General _ Basement Area`, `Basic Building Areas _ 0 _ Exterior`,
                           `Plumbing Information _ 3 Fixture Bath`, `Plumbing Information _ 2 Fixture Bath`, 
                           `Basic Building Areas _ 0 _ Height`)
bsna_mini <- 
  bsna_mini %>% mutate(heightcat = case_when(`Basic Building Areas _ 0 _ Height` %in% c("1    Story", "1.25 Story", "1.5  Story", "1+   Story") ~ 1,
                                             `Basic Building Areas _ 0 _ Height` %in% c("2    Story", "1.75 Story", "2.5  Story", "Bi-Level") ~ 2,
                                             `Basic Building Areas _ 0 _ Height` %in% c("3    Story", "Tri-Level", "3.5  Story") ~ 3,
                                             TRUE ~ -1),
                       extcat = case_when(`Basic Building Areas _ 0 _ Exterior` == "Siding" ~ 1,
                                          `Basic Building Areas _ 0 _ Exterior` == "Siding/Brick" ~ 2,
                                          `Basic Building Areas _ 0 _ Exterior` == "Brick" ~ 3,
                                          TRUE ~ -1),
                       has_garage = ifelse(!is.na(as.numeric(str_replace_all(`Garage Information _ Area`, "sq ft", ""))), 1, 0),
                       basement_num = as.numeric(str_replace_all(`General _ Basement Area`, "sq ft", "")),
                       has_basement = replace_na(ifelse(basement_num != 0, 1, 0), 0),
                       bathnum = replace_na(`Plumbing Information _ 3 Fixture Bath`, 0) + 
                         0.5 * replace_na(`Plumbing Information _ 2 Fixture Bath`, 0),
                       bathcat = case_when(bathnum == 1 ~ 1,
                                           bathnum == 1.5 ~ 2,
                                           between(bathnum, 1.5, 3) ~ 3,
                                           bathnum > 3 ~ 4,
                                           TRUE ~ -1)
                       ) %>%
  select(`Parcel ID`, heightcat, extcat, has_garage, has_basement, bathcat)

joined <- mini %>% mutate(`Parcel ID` = str_replace_all(parcel_num, "\\.$", "")) %>% left_join(bsna_mini, by=c("Parcel ID"))
joined <- joined %>% select(-property_1, -zip_code, -`Parcel ID`)

write_csv(joined, "detroit/data/detroit_sf.csv")
#garage, basement, exterior, bathroom, height
#exteriorcat (1 siding, 2 brick/other, 3 brick, 4 other)
#bathcat (1 1.0, 2 1.5, 3 2 to 3, 4 3+)
#heightcat (1 1 to 1.5, 2 1.5 to 2.5, 3 3+)
