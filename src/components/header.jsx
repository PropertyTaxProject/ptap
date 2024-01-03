import React from "react"
import { Layout, Menu } from "antd"
import coalition from "../assets/coalition_logo.png"
import { CONTACT_EMAIL, HELP_LINK } from "../utils"

const { Header } = Layout

const PTAPHeader = () => (
  <Header>
    {/* TODO: Hacking the menu here, should be a cleaner way of doing this */}
    <Menu mode="horizontal">
      <Menu.Item key="base" disabled>
        <span style={{ color: "black" }}>Property Tax Appeal Project</span>
      </Menu.Item>
      <Menu.Item key="coalition">
        <a
          href="https://illegalforeclosures.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            height={50}
            alt="Coalition for Property Tax Justice Home"
            src={coalition}
          />
        </a>
      </Menu.Item>
      <Menu.Item key="appointment">
        <span style={{ color: "black" }}>
          <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
            Click here to make an appointment
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
