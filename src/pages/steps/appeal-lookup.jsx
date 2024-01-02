import React, { useContext } from "react"
import PinLookup from "../../components/pin-lookup"
import PinChooser from "../../components/pin-chooser"
import AppealIntro from "../content/appeal-intro"
import { Button, Divider, Form, Radio, Row, Col } from "antd"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getPageLabel } from "../../utils"

const AppealLookup = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const setPin = (selectedProperties) => {
    const pin = selectedProperties.length === 0 ? null : selectedProperties[0]
    if (!pin) return

    const target = appeal.propertyOptions.find((o) => pin === o.pin)

    let ineligibleReason = null
    if (
      appeal.eligibility.landlord !== "No" ||
      appeal.eligibility.residence !== "Yes" ||
      appeal.eligibility.owner !== "Yes"
    ) {
      ineligibleReason = "We only serve owner occupied homes."
    } else if (!target.eligible) {
      ineligibleReason =
        "We only serve homes assessed below a certain threshold."
    }
    const eligible = ineligibleReason === null
    if (!eligible) {
      // TODO: Could also set alert message instead of opening window
      window.alert(
        `You may not be eligible to receive our services. ${ineligibleReason} Please contact us for more information`
      )
    }
    dispatch({ type: "set-target", pin, target, eligible })
  }

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <AppealIntro city={appeal.city} />
        </Col>
      </Row>
      <Form
        form={form}
        initialValues={appeal.eligibility}
        name="Eligibility"
        layout="vertical"
        onChange={() =>
          dispatch({
            type: "set-eligibility",
            landlord: form.getFieldValue("landlord"),
            residence: form.getFieldValue("residence"),
            owner: form.getFieldValue("owner"),
          })
        }
        onFinish={() => {}}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="landlord"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Are you a landlord?"
        >
          <Radio.Group name="landlord">
            <Radio value="Yes">Yes</Radio>
            <Radio value="No">No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="residence"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Is this home your primary residence, meaning the place you live most of the year?"
        >
          <Radio.Group name="residence">
            <Radio value="Yes">Yes</Radio>
            <Radio value="No">No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="owner"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Do you own this home?"
        >
          <Radio.Group name="owner">
            <Radio value="Yes">Yes</Radio>
            <Radio value="No">No</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
      <h2>Find Your Home</h2>
      <p>
        Enter your street number and street name below and then hit search.
        After searching from your home, hit the <b>Select button</b> next to
        your address
      </p>
      <PinLookup
        city={appeal.city}
        onSearch={({ candidates: propertyOptions, uuid }) =>
          dispatch({ type: "property-options", propertyOptions, uuid })
        }
      />
      {appeal.propertyOptions && appeal.propertyOptions.length > 0 && (
        <>
          <br />
          <PinChooser
            headers={[
              {
                title: "Address",
                field: "address",
              },
              {
                title: "PIN",
                field: "pin",
              },
            ]}
            propertyOptions={appeal.propertyOptions}
            max={1}
            isSelectLabels
            onChange={setPin}
          />
        </>
      )}
      {appeal.propertyOptions && appeal.propertyOptions.length === 0 && (
        <p>Your property could not be found. Please try searching again.</p>
      )}
      <Divider />
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <p>
            <b>Disclaimer:</b> Completing this application does not guarantee
            that the Project will be able to represent you. The information you
            provide will help the Project determine if we can assist you. After
            completing this application, the Project will try to contact you
            three times. If we don’t hear from you after three attempts, we will
            remove you from our list.
          </p>
        </Col>
      </Row>
      <Divider />
      <Button
        type="primary"
        size="large"
        disabled={!appeal.target}
        onClick={() => {
          // TODO: Turn into actual link
          navigate("./homeowner-info")
        }}
      >
        Next Page
      </Button>
      <Divider />
      <p>{getPageLabel("appeal-lookup")}</p>
    </>
  )
}

export default AppealLookup
