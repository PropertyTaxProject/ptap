import React from "react"
import { Button, Space } from "antd"

const PTAPHeader4 = () => (
  <>
    <h2>Your application has now been submitted.</h2>
    <p>
      <b>What to expect next?</b>
    </p>
    <p>
      Our team will contact you. In the meantime, if you have any questions you
      can reach us at our contact information above.
    </p>

    <Space>
      <Button size="large" type="primary">
        <a
          href="https://illegalforeclosures.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          See more information on our website
        </a>
      </Button>
    </Space>
  </>
)

export default PTAPHeader4
