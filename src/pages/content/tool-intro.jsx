import React from "react"
import { Divider } from "antd"

const ToolIntro = () => (
  <>
    <p>
      This tool will help you figure out whether the City of Detroit is fairly
      assessing your property’s value. If your property is not being fairly
      assessed, this tool provides you with evidence that you can use to protest
      your assessment and lower your tax bill.
    </p>
    <p>
      Before using this tool, we recommend that you{" "}
      <a
        href="https://www.youtube.com/watch?v=3fLN7ZVT2CU"
        target="_blank"
        rel="noopener noreferrer"
      >
        watch this video to understand your property tax assessment notice.
      </a>
    </p>

    <Divider />

    <h3>How to Use This Tool</h3>
    <p>Step 1. Input your address into the search bar below.</p>
    <p>Step 2. Select your address from the list. </p>
    <p>
      Step 3. Compare the City’s estimate of your property’s MARKET VALUE to the
      SALES PRICES of homes that have recently sold in your neighborhood. If the
      market value of your property is HIGHER than the sales prices of similar
      homes, the City is over assessing your property value.
    </p>
    <p>
      Step 4. Select the sale in your neighborhood that is most similar to your
      property. If you aren’t sure, pick the home that is closest to yours.
      Click the “Generate Appeal Evidence” button to receive the property sales
      data that you can attach as evidence to your property tax assessment
      appeal. <br></br> Tip: Make sure the property you select is not in much
      worse condition than your home. If you can, walk or drive by the property
      to check it out.{" "}
    </p>
    <p>
      Step 5. Submit your appeal on your own by emailing it to
      AssessorReview@detroitmi.gov no later than February 22, 2023 (make sure to
      attach the evidence you downloaded from this tool!) or completing our
      interest form to sign up for FREE assistance appealing your property taxes
      no later than February 15, 2023.
    </p>

    <h2>Search and Compare Tool</h2>
    <p>
      This tool finds sales of properties that are similar to yours in your
      neighborhood. The assessor refers to these sales as “Comparable
      Properties.” From these comparable property sales, you can tell what your
      property is likely worth. If the City is assessing your property as though
      it has a higher market value than these sales prices, the City is likely
      over assessing and overtaxing you.
    </p>
    <p>This tool does not file an appeal on your behalf.</p>
  </>
)

export default ToolIntro
