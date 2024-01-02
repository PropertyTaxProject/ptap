import React from "react"
import { Button, Space } from "antd"

const FinalPage = () => (
  <>
    <h2>Your application has now been submitted.</h2>
    <p>
      <b>What to expect next</b>
    </p>
    <p>
      Our team will contact you. In the meantime, if you have any questions you
      can reach us at our contact information above.
    </p>

    <Space>
      <p>Do you want to join our fight for Property Tax Justice?</p>
      <Button size="large" type="primary">
        <a
          href="https://actionnetwork.org/petitions/impacted-detroiters-compensation?source=ptapapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Take Action
        </a>
      </Button>
    </Space>
  </>
)

export default FinalPage
