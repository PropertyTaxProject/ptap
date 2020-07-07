args = commandArgs(trailingOnly=TRUE)
print(args)

target_data <- read.csv(args[1], colClasses = 'character')
comps_data <- read.csv(args[2], colClasses = 'character')

print(target_data)

rmarkdown::render("comps_report.Rmd",
                  params = list(PIN = target_data$PIN,
                                target = target_data,
                                comps = comps_data),
                  output_file = paste0("tmp_data/", target_data$PIN, "_comps.pdf"))

# rmarkdown::render("attachments/appeal_narrative.Rmd",
#                   params = list(PIN = target_pin$PIN,
#                                 inputdata = tbl_data),
#                   output_file = paste0("../reports/", target_pin$PIN, "_narrative.pdf"))



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