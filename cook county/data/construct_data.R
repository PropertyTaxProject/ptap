library(tidyverse)
library(data.table)

file_loc <- "cook county/data/"

#characteristics
characteristics <- fread(paste0(file_loc, "characteristics.csv" ), colClasses = "character")
addresses <- fread(paste0(file_loc, "addresses.csv"), colClasses = "character")

characteristics <- characteristics %>% 
  filter(`Tax Year` == 2019) %>% 
  mutate(PIN10 = str_sub(PIN, 1, 10),
         `Property Address` = str_replace_all(`Property Address`, "  ", " ")) %>% 
  select(PIN, PIN10, `Property Class`, `Neighborhood Code`, `Town Code`, 
         Age, Rooms, Bedrooms, `Half Baths`, `Full Baths`,
         Basement, `Central Heating`, `Central Air`, Fireplaces,
         `Building Square Feet`, `Land Square Feet`, 
         Longitude, Latitude, `Census Tract`, `Property Address`, 
         `Percent Ownership`, `Garage indicator`, `Type of Residence`,
         Apartments, `Wall Material`, `Roof Material`,
         )

addresses <- addresses %>%
  mutate(PIN10 = str_sub(PIN, 1, 10)) %>%
  select(ADDRNOCOM:STNAMECOM, USPSPN, USPSST, ZIP5, ADDRDELIV, CMPADDABRV, ADDRLASTLI, PIN10)

joined <- characteristics %>% left_join(addresses, by=c("Property Address" = "CMPADDABRV", "PIN10"))

#add most recent assessment/sale
assessments <- fread(paste0(file_loc, "assessments.csv"), colClasses = "character") %>% 
  filter(YEAR == 2019)

assessments <- 
  assessments %>% mutate(CCAO_APPEAL = ifelse(APPEALED == "true", 1, 0),
                         WON_CCAO = ifelse(CCAO_APPEAL == "1", ifelse(CHANGED == "YES", 1, 0), NA)) %>% 
  select(PIN, CLASS, NBHD, TOWN, CERTIFIED, `TOWN NAME`, CCAO_APPEAL, WON_CCAO)

sales <- fread(paste0(file_loc, "sales.csv"), colClasses = "character") %>% 
  select(PIN, `Sale Price`, `Sale Year`) %>% 
  filter(`Sale Price` > 1000) %>%
  arrange(-as.numeric(`Sale Year`)) %>%
  distinct(PIN, .keep_all = TRUE)

joined2 <- assessments %>% left_join(sales)

full <- joined %>% left_join(joined2)


res_classes <- c(202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 234, 278, 295)
condos <- c(299)

full <- full %>% mutate(stories_recode = case_when(`Type of Residence` %in% c("1", "4", "5", "6", "7", "8", "9") ~ "1",
                                                   TRUE ~ `Type of Residence`),
                        basement_recode = case_when(Basement %in% c("2", "3", "4") ~ "0",
                                                    Basement == "1" ~ "1")) %>% select(-CLASS, -NBHD, -TOWN)

full <- full %>%
  separate(`Property Address`, " ", into=c("st_num", "st_name"), extra='merge', remove=FALSE)

full2 <- full %>% select('PIN', 'Property Class', 'Age', 'Building Square Feet', 'Land Square Feet', 
                         'Rooms', 'Bedrooms', 'Wall Material', 'stories_recode', 'basement_recode', 'Garage indicator',
                         'CERTIFIED', 'Longitude', 'Latitude', 'Property Address', 'st_num', 'st_name', 'Sale Price', 'Sale Year')

fwrite(full2 %>% filter(`Property Class` %in% res_classes), paste0(file_loc, "cooksf.csv"))
fwrite(full2 %>% filter(`Property Class` %in% condos), paste0(file_loc, "cookcondos.csv"))


fwrite(full2 %>% filter(`Property Class` %in% c(202, 203, 204)), paste0(file_loc, "cooksf1.csv"))
fwrite(full2 %>% filter(`Property Class` %in% c(205, 206, 207, 208, 209, 210, 211, 212, 234, 278, 295)), paste0(file_loc, "cooksf2.csv"))
