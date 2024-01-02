import React from "react"
import PropTypes from "prop-types"
import { Layout } from "antd"
import Header from "../components/header"
import { HELP_LINK } from "../utils"

const { Content, Footer } = Layout

const PageLayout = (props) => (
  <Layout className="layout">
    <Header />
    <Content style={{ padding: "0 3vw" }}>
      <div className="site-layout-content">{props.children}</div>
    </Content>
    <Footer style={{ textAlign: "center" }}>
      <a target="_blank" rel="noopener noreferrer" href={HELP_LINK}>
        Make an appointment
      </a>{" "}
      if you have any questions
    </Footer>
  </Layout>
)

export default PageLayout

PageLayout.propTypes = {
  children: PropTypes.any,
}
