import React from "react"
import PropTypes from "prop-types"
import PinLookup from "../../components/pin-lookup"
import PinChooser from "../../components/pin-chooser"
import AppealIntro from "../content/appeal-intro"
import { Button, Divider, Form, Radio } from "antd"

const AppealLookup = ({
  city,
  target,
  propertyOptions,
  setPropertyOptions,
  setPin,
  setEligibility,
}) => {
  const [form] = Form.useForm()
  return (
    <>
      <AppealIntro city={city} />
      <Form
        form={form}
        name="Eligibility"
        layout="vertical"
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
          <Radio.Group>
            <Radio value="Yes">Yes</Radio>
            <Radio value="No">No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="owner"
          rules={[{ required: true, message: "Your response is required." }]}
          label="Do you own this home?"
        >
          <Radio.Group>
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
        city={city}
        onSearch={(propertyOptions) => setPropertyOptions(propertyOptions)}
      />
      {propertyOptions && propertyOptions.length > 0 && (
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
            propertyOptions={propertyOptions}
            max={1}
            isSelectLabels
            onChange={(selectedProperties) =>
              setPin(
                selectedProperties.length === 0 ? null : selectedProperties[0]
              )
            }
          />
        </>
      )}
      {propertyOptions && propertyOptions.length === 0 && (
        <p>Your property could not be found. Please try searching again.</p>
      )}
      <Divider />
      <Button
        type="primary"
        disabled={!target}
        onClick={() => {
          let ineligibleReason = null
          if (
            form.getFieldValue("residence") !== "Yes" ||
            form.getFieldValue("owner") !== "Yes"
          ) {
            ineligibleReason = "We only serve owner occupied homes."
          } else if (!target.eligible) {
            ineligibleReason =
              "We only serve homes assessed below a certain threshold."
          }
          const eligible = ineligibleReason === null
          if (!eligible) {
            window.alert(
              `You may not be eligible to receive our services. ${ineligibleReason} Please contact us for more information`
            )
          }
          setEligibility(eligible)
        }}
      >
        Next Page
      </Button>
      <br />
      <p>Page 1 of 5</p>
    </>
  )
}

AppealLookup.propTypes = {
  city: PropTypes.string,
  target: PropTypes.object,
  propertyOptions: PropTypes.array,
  setPropertyOptions: PropTypes.func,
  setPin: PropTypes.func,
  setEligibility: PropTypes.func,
}

export default AppealLookup
