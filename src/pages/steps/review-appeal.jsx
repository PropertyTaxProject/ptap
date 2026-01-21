import React, { useContext, useState } from "react"
import { Button, Divider, Table, Space, Row, Col, Image } from "antd"
import { getPageLabel, getProjectConfig } from "../../utils"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitAppeal } from "../../requests"

const userCols = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Mailing Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
]

const compCols = [
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Pin",
    dataIndex: "pin",
    key: "pin",
  },
  {
    title: "Assessed Value",
    dataIndex: "assessed_value_display",
    key: "assessed_value_display",
  },
  {
    title: "Sale Price (if available)",
    dataIndex: "sale_price_display",
    key: "sale_price_display",
  },
  {
    title: "Sale Date",
    dataIndex: "sale_date",
    key: "sale_date",
  },
]

const ReviewAppeal = () => {
  const [loading, setLoading] = useState(false)
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const projectConfig = getProjectConfig(appeal.region)

  const confirmInfo = async () => {
    setLoading(true)
    await submitAppeal(appeal)
    window.sessionStorage.removeItem(`appeal-${appeal.region}`)
    setLoading(false)
    dispatch({ type: "complete" })
    if (window.fbq) {
      window.fbq("track", "SubmitApplication")
    }
    navigate("../complete")
  }

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h1>Your Appeal</h1>
          <p>
            Below is the information you submitted. If the information is
            correct, please click the blue button at the bottom of this page to
            submit your appeal letter.
          </p>
        </Col>
      </Row>

      <Divider />
      <h2>Your Information</h2>
      <Table
        dataSource={[appeal.user].map((user) => ({
          ...user,
          name: `${user.first_name} ${user.last_name}`,
        }))}
        columns={userCols}
        pagination={false}
        scroll={{ x: true }}
      />
      <Divider />
      {appeal.selected_comparables.length > 0 && (
        <>
          <h2>Your Comparables</h2>
          <Table
            dataSource={appeal.selected_comparables}
            columns={compCols}
            pagination={false}
            scroll={{ x: true }}
          />
          <Divider />
        </>
      )}
      <h2>Your Property Condition</h2>
      {projectConfig.includeDamageLevel && (
        <p>
          <strong>Damage level</strong>
          <span style={{ textTransform: "capitalize" }}>
            {" "}
            {(appeal.damage_level || "").replace(/_/g, " ")}
          </span>
        </p>
      )}
      <p>
        <strong>Damage description</strong>
        <br />
        {appeal.damage}
      </p>
      <p>
        <strong>Damage images</strong>
      </p>
      <Image.PreviewGroup>
        {appeal.files.map(({ url }) => (
          <Image width={200} src={url} key={url} />
        ))}
      </Image.PreviewGroup>
      <Divider />
      <Space>
        <Button
          size="large"
          disabled={loading}
          type="danger"
          onClick={() => navigate("../damage")}
        >
          Back
        </Button>
        <Button
          size="large"
          disabled={loading}
          type="primary"
          onClick={confirmInfo}
        >
          Submit Appeal
        </Button>
      </Space>
      <Divider />
      <p>{getPageLabel("review-appeal", appeal)}</p>
    </>
  )
}

export default ReviewAppeal
