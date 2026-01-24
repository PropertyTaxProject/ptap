import React, { useContext } from "react"
import PinLookup from "../../components/pin-lookup"
import PinChooser from "../../components/pin-chooser"
import AppealIntro from "../content/appeal-intro"
import { Button, Divider, Form, Radio, Row, Col } from "antd"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
import { getPageLabel, getProjectConfig } from "../../utils"

const AppealLookup = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const projectConfig = getProjectConfig(appeal.region)

  const checkEligibility = () => {
    let alertMessage = null
    if (!appeal.eligibility.residence || !appeal.eligibility.owner) {
      alertMessage =
        "We do not service landlords. You must be the owner-occupant of the listed property to be eligible for ILO’s services."
    } else if (appeal.eligibility.hope) {
      alertMessage =
        "If your income qualifies you for HOPE, please reach out to Wayne Metro to complete a HOPE application, which will likely result in more property tax savings than filing an appeal. Contact Wayne Metro at [PHONE NUMBER] or Schedule an Appointment with Wayne Metro."
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
    if (!pin) {
      dispatch({
        type: "set-target",
        pin: null,
        target: null,
        eligible: null,
      })
      return
    }

    const target = appeal.search_properties.find((o) => pin === o.pin)

    const eligible = appeal.eligibility.residence && appeal.eligibility.owner
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
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="owner"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Do you own this home?"
        >
          <Radio.Group name="owner">
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        {projectConfig.hopeExemption && (
          <Form.Item
            name="hope"
            rules={[{ required: true, message: "Your response is required." }]}
            label="Have you received the Homeowners Property Exemption (HOPE), Poverty Tax Exemption (PTE), or any other hardship program anytime in the last three years?"
          >
            <Radio.Group name="hope">
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
      <h2>Find Your Home</h2>
      <p>
        Enter your address and then hit the &quot;Select&quot; button next to
        your address.
      </p>
      <PinLookup
        region={appeal.region}
        onSearch={({ search_properties, uuid }) =>
          dispatch({ type: "search-properties", search_properties, uuid })
        }
      />
      {appeal.search_properties && appeal.search_properties.length > 0 && (
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
            propertyOptions={appeal.search_properties}
            max={1}
            isSelectLabels
            onChange={setPin}
            pins={appeal.pin ? [appeal.pin] : []}
          />
          {appeal.pin && (
            <>
              <br />
              <Button
                danger
                onClick={() => {
                  dispatch({
                    type: "set-target",
                    pin: null,
                    target: null,
                    eligible: null,
                  })
                }}
              >
                Reset chosen address
              </Button>
            </>
          )}
        </>
      )}
      {appeal.search_properties && appeal.search_properties.length === 0 && (
        <p>Your property could not be found. Please try searching again.</p>
      )}
      <Divider />
      <Button
        type="primary"
        size="large"
        disabled={
          !appeal.target ||
          [null, undefined].includes(appeal.eligibility?.owner) ||
          [null, undefined].includes(appeal.eligibility?.residence) ||
          ([null, undefined].includes(appeal.eligibility?.hope) &&
            projectConfig.hopeExemption)
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
