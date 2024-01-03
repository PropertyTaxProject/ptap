describe("Appeal flow", () => {
  let contact, detroit, cook
  before(() => {
    cy.fixture("contact").then((f) => {
      contact = f
    })
    cy.fixture("detroit").then((f) => {
      detroit = f
    })
    cy.fixture("cook").then((f) => {
      cook = f
    })
  })

  it("Submits an appeal", () => {
    const regions = [detroit, cook]
    regions.forEach(({ appealUrl, pin, street_number, street_name }) => {
      cy.visit(appealUrl)
      cy.get("#Eligibility_residence [type=radio]").check("Yes")
      cy.get("#Eligibility_owner [type=radio]").check("Yes")
      cy.get("#Eligibility_hope [type=radio]").check("No")

      cy.get("input[placeholder=number]").type(street_number)
      cy.get("input[placeholder=street]").type(street_name)
      cy.get("button[type=submit]").click()
      cy.get(".ant-table-content").contains(pin).should("exist")

      cy.get(".ant-table-cell button").first().click()
      cy.get("button").contains("Next Page").click()

      cy.get("h1").contains("Homeowner Contact Information").should("exist")
      cy.get("#Housing_Information_first_name").type(contact.first_name)
      cy.get("#Housing_Information_last_name").type(contact.last_name)
      cy.get("#Housing_Information_email").type(contact.email)
      cy.get("#Housing_Information_phone").type(contact.phone)
      cy.get("#Housing_Information_phonetype [type=radio]").check("Home")
      cy.get("#Housing_Information_address").type(contact.address)
      cy.get("#Housing_Information_city").type(contact.city)
      cy.get("#Housing_Information_state").type(contact.state)
      cy.get("#Housing_Information_mailingsame [type=radio]").check("Yes")
      cy.get("#Housing_Information_altcontact [type=radio]").check("No")
      cy.get("#Housing_Information_heardabout").click()
      cy.get(".ant-select-dropdown").contains("Local Organization").click()
      cy.get("#Housing_Information_localinput").type("Organization")
      cy.get("button[type=submit]").contains("Next Page").click()

      cy.get("#Agreement_agreement_name").type(contact.name)
      cy.get("button").contains("Next Page").click()

      cy.get(".ant-table-row")
        .contains(`${street_number} ${street_name}`)
        .should("be.visible")

      cy.get("#Housing_Information_validcharacteristics [type=radio]").check(
        "Yes"
      )
      cy.get("button[type=submit]").contains("Next Page").click()

      // comparables.forEach(({ street_number, street_name }) => {
      //   cy.get(".ant-table-content")
      //     .last()
      //     .contains("td", `${street_number} ${street_name}`)
      //     .should("exist")
      //     .parent()
      //     .find("button")
      //     .click()
      // })

      // cy.get("button").contains("Next Page").click()

      cy.get("#damage_damage_level label").contains("Average").click()
      cy.get("button").contains("Next Page").click()

      cy.get("button").contains("Finalize Application").click()

      cy.get("h1")
        .contains("Your application has now been submitted")
        .should("be.visible")
    })
  })
})
