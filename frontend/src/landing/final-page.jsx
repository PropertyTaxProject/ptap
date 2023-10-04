import React from "react"
import { Button, Space } from "antd"
import { Link } from "react-router-dom"

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
      <Button type="primary">
        <Link to="/illegalforeclosures">
          See more information on our website
        </Link>
      </Button>
    </Space>
  </>
)

export default PTAPHeader4
