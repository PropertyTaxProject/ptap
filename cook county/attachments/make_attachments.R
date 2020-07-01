library(tidyverse)
library(data.table)
library(geosphere)
library(knitr)

source("attachments/comps.R")

num_cols <-
  c(
    "Longitude",
    "Latitude",
    "Age",
    "Rooms",
    "Building Square Feet",
    "Land Square Feet",
    "Type of Residence",
    "Bedrooms",
    "Basement",
    "Garage indicator",
    "CERTIFIED"
  )

full <-
  fread("data/combined.csv", colClasses = "character") %>%
  mutate(across(all_of(num_cols), as.numeric)) %>%
  as.data.frame()

make_comps_report(full %>% filter(CERTIFIED < 150000) %>% sample_n(1), full)

