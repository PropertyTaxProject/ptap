import React from "react"
import { Button } from "antd"

const FinalPage = () => (
  <>
    <h1>Your application has now been submitted.</h1>

    <h2>What to expect next</h2>
    <p>
      Our team will contact you before our March 1st deadline. In the meantime,
      if you have any questions, you can send us an email at:{" "}
      <a href="mailto:help@illegalforeclosures.org">
        help@illegalforeclosures.org
      </a>
    </p>

    <h2>Join our fight</h2>
    <p>
      Since 2009, the City of Detroit has illegally over assessed property
      values and inflated its property tax bills. From 2010 to 2016, the City of
      Detroit overtaxed homeowners by $600 million. When homeowners cannot
      afford to pay, Wayne County forecloses on their homes. Since 2009, Wayne
      County foreclosed on 1 in 3 Detroit homes, displacing over 100,000
      Detroiters, for failure to pay the City&apos;s inflated tax bills. Despite
      efforts to address the problem, the City continues to illegally and
      inequitably tax Detroiters, especially those who own lower-valued homes.
    </p>
    <p>
      Will you join our fight to compensate Detroit homeowners who have been
      illegally over assessed by the City of Detroit?
    </p>
    <Button size="large" type="primary">
      <a
        href="https://actionnetwork.org/petitions/impacted-detroiters-compensation?source=ptapapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        Sign our compensation petition
      </a>
    </Button>
  </>
)

export default FinalPage
