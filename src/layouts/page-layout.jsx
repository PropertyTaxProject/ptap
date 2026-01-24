import React from "react"
import PropTypes from "prop-types"
import { Layout, Divider, Row, Col } from "antd"
import Header from "../components/header"
import { HELP_LINK } from "../utils"
import Pixel from "../components/pixel"

const { Content, Footer } = Layout

const PageLayout = (props) => (
  <Layout className="layout">
    <Pixel />
    <Header />
    <Content style={{ padding: "0 3vw" }}>
      <div className="site-layout-content">
        {props.children}
        <Divider />
        <Row>
          <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
            <p>
              <b>Disclaimer:</b> The Institute for Law & Organizing and the
              Coalition for Property Tax Justice are not providing you with
              legal advice or representation. This is a self-help tool and you
              are responsible for your own appeal.
            </p>
          </Col>
        </Row>
      </div>
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
