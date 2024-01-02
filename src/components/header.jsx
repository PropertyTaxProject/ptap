import React from "react"
import { Layout, Menu } from "antd"
import coalition from "../assets/coalition_logo.png"
import { CONTACT_EMAIL, HELP_LINK } from "../utils"

const { Header } = Layout

const PTAPHeader = () => (
  <Header>
    <Menu mode="horizontal">
      <Menu.Item key="base">
        <a href="/">Property Tax Appeal Project</a>
      </Menu.Item>
      <Menu.Item key="coalition">
        <a
          href="https://illegalforeclosures.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img height={50} alt="Coalition Logo" src={coalition} />
        </a>
      </Menu.Item>
      <Menu.Item key="appointment">
        <span style={{ color: "black" }}>
          <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
            Make an appointment
          </a>
        </span>
      </Menu.Item>
      <Menu.Item key="email" disabled={true}>
        <span style={{ color: "black" }}>Email us at: {CONTACT_EMAIL}</span>
      </Menu.Item>
    </Menu>
  </Header>
)

export default PTAPHeader
