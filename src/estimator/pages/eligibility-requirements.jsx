import React, { useState } from "react"
import PropTypes from "prop-types"
import { lookupPin, estimatePin } from "../../requests"
import { Form, Input, Button, Table } from "antd"

var submitted = false
var selected = false
var working = false
var showresult = false
let appealType = "detroit_single_family"

const PinLookup = (props) => {
  const [form] = Form.useForm()
  const [pins, setPin] = useState([])
  const { logPin, logUuid, setRecord } = props

  const selectPin = (record) => {
    //log pin
    logPin(record.pin)
    setPin([record])
    setRecord(record)
    selected = true
    submitted = false
  }

  const logResponse = (theResponse) => {
    submitted = true
    selected = false
    try {
      setPin(theResponse.candidates)
      logUuid(theResponse.uuid)
    } catch (err) {
      setPin([])
    }
  }

  var columns = [
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
      title: "Action",
      key: "action",
      render: (record) => (
        <Button
          onClick={() => {
            selectPin(record)
          }}
        >
          Select
        </Button>
      ),
    },
  ]

  if (selected) {
    columns = [
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
        title: "Action",
        key: "action",
        render: (record) => (
          <Button
            type="primary"
            onClick={() => {
              selectPin(record)
            }}
          >
            Selected
          </Button>
        ),
      },
    ]
  }

  return (
    <>
      <Form
        form={form}
        name="Pin Lookup"
        layout="vertical"
        onFinish={async (data) => {
          logResponse(await lookupPin({ appeal_type: appealType, ...data }))
        }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
        size="large"
      >
        <p style={{ width: "350px" }}>
          Enter your street number and street name and select your property from
          the table.
        </p>

        <Input.Group compact>
          <Form.Item
            style={{ width: "100px" }}
            name="st_num"
            rules={[{ required: true, message: "Street number is required." }]}
          >
            <Input inputMode="numeric" placeholder="number" />
          </Form.Item>
          <Form.Item
            style={{ width: "300px" }}
            name="st_name"
            rules={[{ required: true, message: "Street name is required." }]}
          >
            <Input placeholder="street" />
          </Form.Item>
          <Button htmlType="submit">Search</Button>
        </Input.Group>
      </Form>

      {pins.length !== 0 ? (
        <>
          <br />
          <Table columns={columns} dataSource={pins} />
        </>
      ) : submitted ? (
        "Your property could not be found. Please try searching again."
      ) : null}
    </>
  )
}

PinLookup.propTypes = {
  logPin: PropTypes.func,
  logUuid: PropTypes.func,
  setRecord: PropTypes.func,
}

const Lookup = (props) => {
  const [form] = Form.useForm()
  const { logPin, city, logUuid, logEligibility } = props
  const [targRecord, setRecord] = useState([])
  const [estimate, setEstimate] = useState([])

  const ptapLanguage = (
    <div>
      <body>
        <br />
        If you want FREE help protesting your property tax assessment, contact
        the{" "}
        <b>
          Property Tax Appeal Project
          <a href="https://actionnetwork.org/forms/property-tax-assessment-appeal-interest-form?source=estimator_app">
            {" "}
            here.{" "}
          </a>
        </b>
        <br />
        <br />
        *Other factors may impact your tax bill such as exemptions or caps on
        your property&apos;s taxable value. To qualify for services, you must
        live in an owner occupied home and your home must be assessed at
        $100,000 or less.
      </body>
    </div>
  )

  return (
    <>
      <h2>Detroit Over-Assessment Estimator</h2>
      <p>
        This app estimates the likelihood that your property is over-assessed.
      </p>
      <PinLookup
        city={city}
        logPin={logPin}
        logUuid={logUuid}
        setRecord={setRecord}
      />
      <Form
        form={form}
        name="Eligibility"
        layout="vertical"
        onFinish={async () => {
          working = true
          selected = false
          var pin = targRecord.pin
          logEligibility(true)
          const response = await estimatePin({ appeal_type: appealType, pin })
          if (response != null) {
            showresult = true
            working = false
            setEstimate(response.estimate)
          }
        }}
        labelAlign="left"
        scrollToFirstError
        autoComplete="off"
      >
        {submitted && (
          <p>
            After searching for your home, please hit <b>Select</b> next to your
            property
          </p>
        )}
        {selected && (
          <Button type="primary" htmlType="submit">
            Get Estimate
          </Button>
        )}
        {working && <p>Generating your estimate please wait...</p>}
        {showresult && <div>{estimate}</div>}
        {showresult && ptapLanguage}
      </Form>
    </>
  )
}

Lookup.propTypes = {
  logPin: PropTypes.func,
  city: PropTypes.string,
  logUuid: PropTypes.func,
  logEligibility: PropTypes.func,
}

export default Lookup
