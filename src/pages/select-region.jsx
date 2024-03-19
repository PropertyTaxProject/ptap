import React from "react"
import { Button, Space } from "antd"
import { Link } from "react-router-dom"

const SelectRegion = () => (
  <>
    <h2>
      We currently have automated appeal systems for Detroit, Michigan and Cook
      County, Illinois.
    </h2>
    <p>Click one of the buttons to get started with your appeal.</p>
    <Space>
      <Button size="large">
        <Link to="/detroit">Detroit</Link>
      </Button>
      <Button size="large">
        <Link to="/cook">Cook County</Link>
      </Button>
      <Button size="large">
        <Link to="/milwaukee">Milwaukee</Link>
      </Button>
    </Space>
  </>
)

export default SelectRegion
