describe("Search and compare flow", () => {
  let detroit
  before(() => {
    cy.fixture("detroit").then((f) => {
      detroit = f
    })
  })

  it("Searches and submits an address", () => {
    const regions = [detroit]
    regions.forEach(
      ({
        compareUrl,
        pin,
        street_number,
        street_name,
        assessed_value,
        updated_assessed_value,
        comparables,
      }) => {
        cy.visit(compareUrl)
        cy.get("input[placeholder=number]").type(street_number)
        cy.get("input[placeholder=street]").type(street_name)
        cy.get("button[type=submit]").click()
        cy.get(".ant-table-content").contains(pin).should("exist")

        cy.get(".ant-table-cell button").click()
        cy.get("#Eligibility button").click()

        comparables.forEach(({ street_number, street_name }) => {
          cy.get(".ant-table-content")
            .contains("td", `${street_number} ${street_name}`)
            .should("exist")
            .parent()
            .find("button")
            .click()
        })

        cy.get(".ant-btn-primary").contains("Generate Appeal Evidence").click()
        cy.get(".site-layout-content")
          .contains(assessed_value)
          .contains(updated_assessed_value)
          .should("exist")
      }
    )
  })
})
