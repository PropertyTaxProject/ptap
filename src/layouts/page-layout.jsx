import React from "react"
import PropTypes from "prop-types"
import { Layout } from "antd"
import Header from "../components/header"

const { Content, Footer } = Layout

const PageLayout = (props) => (
  <Layout className="layout">
    <Header />
    <Content style={{ padding: "0 3vw" }}>
      <div className="site-layout-content">{props.children}</div>
    </Content>
    <Footer style={{ textAlign: "center" }}>
      Call 313-438-8698 with any questions. Please leave a message if we
      don&apos;t pick up and we will return your call within 48 hours.
    </Footer>
  </Layout>
)

export default PageLayout

PageLayout.propTypes = {
  children: PropTypes.any,
}
