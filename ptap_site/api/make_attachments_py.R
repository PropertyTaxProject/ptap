args = commandArgs(trailingOnly=TRUE)
target_data <- read.csv(args[1], colClasses = 'character')
comps_data <- read.csv(args[2], colClasses = 'character')

rmarkdown::render("comps_report.Rmd",
                  params = list(PIN = target_data$PIN,
                                target = target_data,
                                comps = comps_data),
                  output_file = paste0("tmp_data/", target_data$PIN, "_comps.pdf"),
                  envir = new.env())


rmarkdown::render("appeal_narrative.Rmd",
                  params = list(PIN = target_data$PIN,
                                target = target_data,
                                comps = comps_data),
                  output_file = paste0("tmp_data/", target_data$PIN, "_narrative.pdf"),
                  envir = new.env())
