import React, { useContext, useState } from "react"
import { Button, Divider, Form, Radio, Row, Space, Col, Input } from "antd"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { submitAgreement } from "../../requests"

const Agreement = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 12, offset: 0 }}>
          <h1>Agreement</h1>
          <p>
            Once you complete this app, the Institute for Law and Organizing
            will create an appeal letter for FREE.
          </p>
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
              name="agreement"
              rules={[
                { required: true, message: "Your response is required." },
              ]}
              label="Please select how you would like to submit your appeal letter"
            >
              <Radio.Group
                name="agreement"
                onChange={(e) =>
                  dispatch({ type: "set-agreement", agreement: e.target.value })
                }
              >
                <Radio value={true}>
                  <strong>
                    I want FREE ASSISTANCE submitting my appeal from the
                    Institute for Law and Organizing.
                  </strong>
                </Radio>
                <Radio value={false}>
                  <strong>
                    I do NOT want free assistance submitting my appeal from the
                    Institute for Law and Organizing.
                  </strong>
                  <br />
                  <span>
                    If you choose this option your appeal letter will be sent to
                    you by February 15th, and you will have to submit it to the
                    Detroit March Board of Review WITHOUT ASSISTANCE from the
                    Institute for Law and Organizing.
                  </span>
                </Radio>
              </Radio.Group>
            </Form.Item>
            {appeal.agreement && (
              <>
                <h2>Representation Agreement</h2>
                <p>
                  By typing your name below, you are signing a document that
                  allows the Institute for Law and Organizing (“ILO”) to
                  represent you in appealing your property tax assessment before
                  the City of Detroit&apos;s March Board of Review.
                </p>
                <ul>
                  <li>
                    By signing this agreement, ILO is not agreeing to represent
                    you as an attorney or on any matters other than the appeal
                    of your property tax assessment.
                  </li>
                  <li>
                    ILO’s representatives are not Michigan-licensed attorneys.
                  </li>
                  <li>ILO agrees to represent you for FREE.</li>
                  <li>
                    ILO will help you draft your appeal letter, with the
                    assistance of this application. If you complete this online
                    application and respond quickly to any communications from
                    ILO regarding the letter, ILO will file your letter.
                  </li>
                  <li>
                    If ILO files your appeal letter, ILO will argue your appeal
                    before the March Board of Review.
                  </li>
                </ul>
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
              </>
            )}
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
          disabled={
            !(
              appeal.agreement === false ||
              (appeal.agreement && appeal.agreement_name)
            ) || loading
          }
          onClick={async () => {
            setLoading(true)
            // TODO: Handle this, allow feature flagging in dev
            try {
              await submitAgreement(appeal)
            } catch (e) {
              console.error(e)
            }
            navigate("../review-property")
          }}
        >
          Next Page
        </Button>
      </Space>

      <Divider />
      <p>Page 3 of 7</p>
    </>
  )
}

export default Agreement
