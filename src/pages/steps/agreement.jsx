import React, { useContext, useState } from "react"
import { Button, Divider, Form, Row, Space, Col, Input } from "antd"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitAgreement } from "../../requests"
import { getPageLabel } from "../../utils"

const Agreement = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <h1>Representation Agreement</h1>
          <p>
            The Institute for Law and Organizing (“the Institute”) is a
            nonprofit community organization that is working in Detroit,
            Milwaukee, Chicago, and nationally to end racialized property tax
            administration in America. The Coalition for Property Tax
            Justice–the Institute&apos;s Detroit campaign–has partnered with
            University of Detroit Mercy School of Law Housing Law Clinic (“the
            Clinic”). By typing your name below, you are signing a document that
            allows the Institute and the Clinic to represent you in appealing
            your property tax assessment before the City of Detroit&apos;s March
            Board of Review, if eligible for our services.
          </p>
          <ul>
            <li>
              The Institute and the Clinic agree to represent you for FREE.
            </li>
            <li>
              By signing this agreement, the Institute and the Clinic are not
              agreeing to represent you on any matters other than the appeal of
              your property tax assessment.
            </li>
            <li>
              The Institute and the Clinic&apos;s representatives are not
              Michigan-licensed attorneys, as allowed by Section 44-4-6(b)-(c)
              of the Detroit City Code. State law also permits non-attorney
              representatives to represent you before the Michigan Tax Tribunal
              (MCL 205.735a(10)).
            </li>
            <li>
              The Institute and the Clinic will draft your appeal letter, with
              the assistance of this application. If you complete this online
              application and respond in a timely manner to any communications
              from the Institute and the Clinic regarding the letter, the
              Institute and the Clinic will file your letter.
            </li>
            <li>
              If the Institute and the Clinic file your appeal letter, they will
              argue your appeal before the March Board of Review.
            </li>
          </ul>
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
            <Form.Item
              name="agreement_name"
              rules={[
                { required: true, message: "Your response is required." },
              ]}
              label="Type your name below to sign this Representation Agreement"
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
          </Form>
        </Col>
      </Row>
      <Divider />
      <Space>
        <Button
          type="danger"
          size="large"
          disabled={loading}
          onClick={() => navigate("../homeowner-info")}
        >
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={!appeal.agreement_name || loading}
          onClick={async () => {
            setLoading(true)
            // TODO: Handle this, allow feature flagging in dev
            // Don't re-submit agreement if this is a resumed appeal
            if (!appeal.resumed) {
              try {
                await submitAgreement(appeal)
              } catch (e) {
                console.error(e)
              }
            }
            navigate("../review-property")
          }}
        >
          Next Page
        </Button>
      </Space>

      <Divider />
      <p>{getPageLabel("agreement", appeal)}</p>
    </>
  )
}

export default Agreement
