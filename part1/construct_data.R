library(tidyverse)
library(data.table)

#characteristics
characteristics <- fread("data/characteristics.csv", colClasses = "character")
addresses <- fread("data/addresses.csv", colClasses = "character")

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
assessments <- fread("data/assessments.csv", colClasses = "character") %>% 
  filter(YEAR == 2019)

assessments <- 
  assessments %>% mutate(CCAO_APPEAL = ifelse(APPEALED == "true", 1, 0),
                         WON_CCAO = ifelse(CCAO_APPEAL == "1", ifelse(CHANGED == "YES", 1, 0), NA),
                         WON_BOR = ifelse(`BOR RESULT` < CERTIFIED, 1, 0)) %>% 
  select(PIN, CLASS, NBHD, TOWN, `BOR RESULT`, `TOWN NAME`, CCAO_APPEAL, WON_CCAO, WON_BOR)

sales <- fread("data/sales.csv", colClasses = "character") %>% 
  select(PIN, `Sale Price`, `Sale Year`) %>% 
  filter(`Sale Price` > 1000) %>%
  arrange(-as.numeric(`Sale Year`)) %>%
  distinct(PIN, .keep_all = TRUE)

joined2 <- assessments %>% left_join(sales)

full <- joined %>% left_join(joined2)
write_csv(full, "data/combined.csv")

