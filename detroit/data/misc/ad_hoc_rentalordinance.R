library(tidyverse)
library(sf)
library(lubridate)




file_loc <- "E:/report data/Detroit/Detroit New/open data refresh/Parcels-shp/96caebee-aa31-4840-ad1b-18cf566d6b6e202047-1-vklj93.jb3n9.shp"

parcels <- st_read(file_loc) 


rental_full <- read_csv("detroit/data/misc/Rental_Statuses.csv")
inspections_full <- read_csv("detroit/data/misc/Residential_Inspections.csv")
coc <- read_csv("detroit/data/misc/Certificates_Of_Occupancy.csv")

rental <- rental_full %>% mutate(rental = 1, 
                            rental_date = ymd_hms(date_status)) %>% 
  select(rental, rental_date, parcel_id) %>% distinct(parcel_id, .keep_all = TRUE)

inspections <- inspections_full %>% mutate(inspection = 1, 
                                      inspection_date = ymd_hms(status_date)) %>% 
  select(inspection, inspection_date, parcel_id) %>% arrange(desc(inspection_date)) %>% distinct(parcel_id, .keep_all = TRUE)


blight <- read_csv("~/../Downloads/Blight_Violations.csv")

likely_rentals <- blight %>% filter(violation_description %in% 
                                      c("Failure of owner to obtain certificate of compliance",
                                        "Failure to obtain certificate of registration for rental property"))
likely_rentals <- 
  likely_rentals %>% mutate(date = ymd_hms(violation_date),
                            year = year(date)) %>%
  select(year, parcelno, violation_description) %>% distinct() %>% filter(year > 2016)

likely_rentals <- likely_rentals %>% distinct(parcelno, violation_description)

likely_rentals <- likely_rentals %>% mutate(cnt = 1) %>% pivot_wider(names_from = violation_description, values_from = cnt, values_fill = 0)

parcels2 <- 
  parcels %>% as.data.frame() %>% 
  select(parcel_num, address, zip_code, taxpayer_1,
                     property_c, property_1, use_code_d, tax_status, total_squa,
                     total_acre, frontage, depth, homestead_, total_floo,
                     year_built, assessed_v, taxable_va)

parcels2 <- parcels2 %>% left_join(rental, by=c("parcel_num" = "parcel_id")) %>% 
  left_join(inspections, by=c("parcel_num" = "parcel_id")) %>% 
  left_join(likely_rentals, by=c("parcel_num" = "parcelno"))


parcels2 <- parcels2 %>% mutate(rental_status = case_when(inspection == 1 ~ 1,
                                                          rental == 1 ~ 0,
                                                          `Failure to obtain certificate of registration for rental property` == 1 ~ 0,
                                                          `Failure of owner to obtain certificate of compliance` == 1 ~ -1,
                                                          TRUE ~ NA_real_))


parcels2 %>% write_csv("detroit/data/misc/rentalordinance.csv")
