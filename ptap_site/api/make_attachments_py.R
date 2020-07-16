args = commandArgs(trailingOnly=TRUE)
target_data <- read.csv(args[1], colClasses = 'character')
comps_data <- read.csv(args[2], colClasses = 'character')
current_juris <- args[3]


if(current_juris == "cook_county_single_family"){
  rmarkdown::render("cook_comps_report.Rmd",
                    params = list(PIN = target_data$PIN,
                                  target = target_data,
                                  comps = comps_data),
                    output_file = paste0("tmp_data/", target_data$PIN, "_comps.pdf"),
                    envir = new.env())
  
  
  rmarkdown::render("cook_appeal_narrative.Rmd",
                    params = list(PIN = target_data$PIN,
                                  target = target_data,
                                  comps = comps_data),
                    output_file = paste0("tmp_data/", target_data$PIN, "_narrative.pdf"),
                    envir = new.env())
} else if (current_juris == "detroit_single_family"){
  file_output <- paste0("tmp_data/", target_data$PIN, " Protest Letter Updated ", format(Sys.time(), "%m_%d_%y"), ".docx")

  rmarkdown::render("detroit_letter.Rmd",
                    params = list(target = target_data,
                                  comps = comps_data),
                    output_file = file_output,
                    envir = new.env())
}


