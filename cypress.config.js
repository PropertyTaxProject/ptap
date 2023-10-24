const { defineConfig } = require("cypress")

module.exports = defineConfig({
  port: 8080,
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config)
    },
    baseUrl: process.env.BASE_URL || "http://localhost:5000",
    experimentalRunAllSpecs: true,
  },
})
