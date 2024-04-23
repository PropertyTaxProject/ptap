import React, { useContext } from "react"
import { Button, Divider, Form, Row, Space, Col, Input } from "antd"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getPageLabel } from "../../utils"

const MkeAgreement = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      initialValues={appeal}
      name="Agreement"
      layout="vertical"
      onFinish={() => {}}
      labelAlign="left"
      autoComplete="off"
      size="large"
    >
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h1>Release of Information</h1>
          <p>
            I agree that Community Advocates can share the information I provide
            with the University of Wisconsin Law School and the Institute for
            Law and Organizing in order to coordinate services.
          </p>
          <Form.Item
            name="release_name"
            rules={[{ required: true, message: "Your response is required." }]}
            label="Type your name below to sign this Release of Information."
          >
            <Input
              name="agreement_name"
              onChange={(e) =>
                dispatch({
                  type: "set-agreement-name",
                  agreement_name: e.target.value,
                })
              }
            />
          </Form.Item>
          <h2>Explanation of Services</h2>
          <p>If Community Advocates determines I am eligible for services:</p>
          <ul>
            <li>
              I understand that the services I receive through this program are
              FREE.
            </li>
            <li>
              I understand that Community Advocates will refer my application to
              the University of Wisconsin Law School so that a clinical law
              student and/or attorney can determine if there is evidence my home
              has been overassessed.
            </li>
            <li>
              I understand there is no guarantee that the University of
              Wisconsin Law School will be able to represent me.
            </li>
            <li>
              If the University of Wisconsin Law School is able to represent me,
              I understand that it will reach out to me to offer representation,
              that this representation will be FREE, and it will be limited to
              appealing my most recent property tax assessment.
            </li>
          </ul>
          <Form.Item
            name="terms_name"
            rules={[{ required: true, message: "Your response is required." }]}
            label="Type your name below if you understand and agree to these terms"
          >
            <Input
              name="terms_name"
              onChange={(e) =>
                dispatch({
                  type: "set-terms-name",
                  terms_name: e.target.value,
                })
              }
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Space>
        <Button
          type="danger"
          size="large"
          onClick={() => navigate("../homeowner-info")}
        >
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={!(appeal.agreement_name && appeal.terms_name)}
          onClick={async () => {
            navigate("../review-property")
          }}
        >
          Next Page
        </Button>
      </Space>

      <Divider />
      <p>{getPageLabel("mke-agreement", appeal)}</p>
    </Form>
  )
}

export default MkeAgreement
