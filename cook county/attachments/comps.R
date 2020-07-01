calc_dist <- function(target_pin, comps_universe, dist_filter) {
  comps_universe <-
    comps_universe %>% mutate(DISTANCE =
                                distHaversine(
                                  cbind(target_pin$Longitude, target_pin$Latitude),
                                  comps_universe %>% select(Longitude, Latitude)
                                ) *
                                3.28084 / 5280) %>%
    filter(DISTANCE < dist_filter)
   return(comps_universe)
}

get_comps <- function(target_pin, comps_universe, multiplier){
  full <- comps_universe
  #constants
  age_dif <- 10 * multiplier
  build_dif <- 0.05 * multiplier
  land_dif <- 0.25 * multiplier
  wall_material <- "Match" #wall material 1=wood, 2=masonry, 3=wood&masonry, 4=stucco
  distance_filter <- 1 * multiplier #miles
  stories <- "Match" #1, 2, or 3 stories
  rooms_dif <- 1 * multiplier
  bedroom_dif <- 1 * multiplier
  basement <- "Match" #1 full, 0 partial
  garage_ind <- "Match" #1 any garage 0 no garage
  
  comps_universe <-
    comps_universe %>% filter(
      between(Age, target_pin$Age - age_dif, target_pin$Age + age_dif),
      between(
        `Building Square Feet`,
        (1 - build_dif) * target_pin$`Building Square Feet`,
        (1 + build_dif) * target_pin$`Building Square Feet`
      ),
      between(
        `Land Square Feet`,
        (1 - land_dif) * target_pin$`Land Square Feet`,
        (1 + land_dif) * target_pin$`Land Square Feet`
      ),
      between(
        Rooms,
        target_pin$Rooms - rooms_dif,
        target_pin$Rooms + rooms_dif,
      ),
      between(
        Bedrooms,
        target_pin$Bedrooms - bedroom_dif,
        target_pin$Bedrooms + bedroom_dif,
      ),
      PIN != target_pin$PIN
    )
  
  if (wall_material == "Match") {
    comps_universe <-
      comps_universe %>% filter(`Wall Material` == target_pin$`Wall Material`)
  }
  if (stories == "Match") {
    comps_universe <-
      comps_universe %>% filter(stories_recode == target_pin$stories_recode)
  }
  if (basement == "Match") {
    comps_universe <-
      comps_universe %>% filter(basement_recode == target_pin$basement_recode)
  }
  if (garage_ind == "Match") {
    comps_universe <-
      comps_universe %>% filter(`Garage indicator` == target_pin$`Garage indicator`)
  }
  if (nrow(comps_universe) > 0) {
    comps_universe <-
      calc_dist(target_pin, comps_universe, distance_filter)
  }
  
  if((nrow(comps_universe) < 7) & (multiplier < 6)) {
    comps_universe <- get_comps(target_pin, full, multiplier * 1.5)
  }
  return(comps_universe)
}

process_one_pin <- function(target_pin, comps_universe){
  cur_comps <- get_comps(target_pin, comps_universe, 1)
  
  if(nrow(cur_comps) > 5){
    dist_weight <- 1
    valuation_weight <- 3
    
    #generate distributions
    dist_funct <- ecdf(cur_comps$DISTANCE)
    val_funct <- ecdf(cur_comps$CERTIFIED)
    
    cur_comps <-
      cur_comps %>% mutate(
        dist_dist = dist_funct(DISTANCE),
        val_dist = val_funct(CERTIFIED),
        score = dist_weight * dist_dist + valuation_weight * val_dist
      )
    
    top_comps <- cur_comps %>% top_n(-6, score)
    
    if(mean(top_comps$CERTIFIED) < target_pin$CERTIFIED){
      cur_comps <- top_comps
    } else {
      
    }
    cur_comps <- cur_comps %>% arrange(score)
  } else {
    cur_comps <- data.frame()
    print(target_pin$PIN)
  }
  return(cur_comps)
}

summary_data <- function(target_pin, comps){
  r1 <- 
    target_pin %>% select(
    PIN,
    `Property Address`,
    `Property Class`,
    Age,
    Rooms,
    Bedrooms,
    Basement,
    `Building Square Feet`,
    `Land Square Feet`,
    `Garage indicator`,
    `Wall Material`,
    `Type of Residence`,
    CERTIFIED
  ) %>% mutate(
    DISTANCE = "0 feet",
    Status = "Target PIN"
  )
  
  rcomps <- comps %>% select(
    PIN,
    `Property Address`,
    `Property Class`,
    Age,
    Rooms,
    Bedrooms,
    Basement,
    `Building Square Feet`,
    `Land Square Feet`,
    `Garage indicator`,
    `Wall Material`,
    `Type of Residence`,
    CERTIFIED,
    DISTANCE
  ) %>% mutate(DISTANCE = paste0(round(DISTANCE * 5280), " feet"),
               Status = "Comparable")
  
  full <- rbind(r1, rcomps)
  
  full <- full %>% rename(
    Class = `Property Class`,
    `Building SQFT` = `Building Square Feet`,
    `Land SQFT` = `Land Square Feet`,
    Distance = DISTANCE,
    `Assessed Value` = CERTIFIED
  )
  
  return(full)
}


make_comps_report <- function(target_pin, comps_universe){
  comps <- process_one_pin(target_pin, comps_universe)
  tbl_data <- summary_data(target_pin, comps)

  rmarkdown::render("attachments/comps_report.Rmd",
                    params = list(PIN = target_pin$PIN,
                                  inputdata = tbl_data),
                    output_file = paste0("../reports/", target_pin$PIN, "_comps.pdf"))
  
  rmarkdown::render("attachments/appeal_narrative.Rmd",
                    params = list(PIN = target_pin$PIN,
                                  inputdata = tbl_data),
                    output_file = paste0("../reports/", target_pin$PIN, "_narrative.pdf"))
}

process_many_pins <- function(target_pins, comps_universe){
  results <- data.frame()
  for (i in seq(1:nrow(target_pins))){
    if (i %% 100 == 0){
      print(i)
    }
    target_pin <- target_pins[i, ]
    cur_comps <- process_one_pin(target_pin, comps_universe)
    if(nrow(cur_comps > 0)){
      result <- 
        cur_comps %>% summarize(mean_comp = mean(CERTIFIED),
                                median_comp = median(CERTIFIED),
                                mean_dist = mean(DISTANCE),
                                var_price_sq = var(CERTIFIED / `Building Square Feet`))
      result$PIN <- target_pin$PIN
      result$CERTIFIED <- target_pin$CERTIFIED
      results <- rbind(results, result)
    }
  }
  return(results)
}
