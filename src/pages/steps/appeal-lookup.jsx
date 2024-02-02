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

  const checkEligibility = () => {
    let alertMessage = null
    if (
      appeal.eligibility.residence !== "Yes" ||
      appeal.eligibility.owner !== "Yes"
    ) {
      alertMessage =
        "We do not service landlords. You must be the owner-occupant of the listed property to be eligible for ILO’s services."
    } else if (appeal.eligibility.hope === "Yes") {
      alertMessage =
        "If you qualify for HOPE, instead of filing an appeal, we will send you to our partners at Wayne Metro, who will help you complete a HOPE application."
    } else if (!appeal.target.eligible) {
      // alertMessage =
      //   "You may not be eligible to receive our services. We only serve homes assessed below a certain threshold."
    }
    const eligible = alertMessage === null
    if (!eligible) {
      // TODO: Could also set alert message instead of opening window
      window.alert(alertMessage)
    }
  }

  const setPin = (selectedProperties) => {
    const pin = selectedProperties.length === 0 ? null : selectedProperties[0]
    if (!pin) return

    const target = appeal.propertyOptions.find((o) => pin === o.pin)

    const eligible =
      appeal.eligibility.residence !== "Yes" &&
      appeal.eligibility.owner !== "Yes"
    dispatch({ type: "set-target", pin, target, eligible })
  }

  return (
    <>
      <Row>
        <Col xs={{ span: 24, offset: 0 }} md={{ span: 16, offset: 0 }}>
          <AppealIntro region={appeal.region} />
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
            residence: form.getFieldValue("residence"),
            owner: form.getFieldValue("owner"),
            hope: form.getFieldValue("hope"),
          })
        }
        onFinish={() => {}}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        size="large"
      >
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
        {appeal.region === "detroit" && (
          <Form.Item
            name="hope"
            rules={[{ required: true, message: "Your response is required." }]}
            label="Have you received the Homeowners Property Exemption (HOPE), Poverty Tax Exemption (PTE), or any other hardship program anytime in the last three years?"
          >
            <Radio.Group name="hope">
              <Radio value="Yes">Yes</Radio>
              <Radio value="No">No</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
      <h2>Find Your Home</h2>
      <p>
        Below, enter your street number, then your street name, and then hit
        search. After searching for your home, hit the <strong>“Select”</strong>{" "}
        button next to your address.
      </p>
      <PinLookup
        region={appeal.region}
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
            pins={appeal.pin ? [appeal.pin] : []}
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
            <b>Disclaimer:</b> The information you provide will help ILO
            determine if we can assist you. Therefore, we cannot guarantee that
            ILO will be able to represent you. After completing this
            application, ILO will try to contact you three times. If we
            don&apos;t hear from you after three attempts, we will not be able
            to submit your appeal.
          </p>
        </Col>
      </Row>
      <Divider />
      <Button
        type="primary"
        size="large"
        disabled={
          !appeal.target ||
          !appeal.eligibility?.owner ||
          !appeal.eligibility?.residence ||
          (!appeal.eligibility?.hope && appeal.region === "detroit")
        }
        onClick={() => {
          // TODO: Turn into actual link
          checkEligibility()
          navigate("./homeowner-info")
        }}
      >
        Next Page
      </Button>
      <Divider />
      <p>{getPageLabel("appeal-lookup", appeal)}</p>
    </>
  )
}

export default AppealLookup
