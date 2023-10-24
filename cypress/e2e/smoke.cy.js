describe("Smoke test", () => {
  before(() => {
    cy.request({ method: "GET", url: "/fixtures/", failOnStatusCode: true })
  })

  it("Loads the landing page", () => {
    cy.visit("/")
    cy.injectAxe()
    cy.get(".site-layout-content").should("be.visible")
  })
})
