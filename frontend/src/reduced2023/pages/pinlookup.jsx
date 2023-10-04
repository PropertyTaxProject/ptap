import React, { useState } from "react"
import PropTypes from "prop-types"
import { lookupPin } from "../../requests"
import { Form, Input, Button, Table } from "antd"

var submitted = false
var selected = false

const PinLookup = (props) => {
  const [form] = Form.useForm()
  const [pins, setPin] = useState([])
  const { logPin, logUuid, setRecord, setSelect, appealType } = props

  const selectPin = (record) => {
    //log pin
    logPin(record.PIN)
    setPin([record])
    setRecord(record)
    selected = true
    setSelect(true)
    submitted = true
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
      dataIndex: "Address",
      key: "Address",
    },
    {
      title: "Pin",
      dataIndex: "PIN",
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
        dataIndex: "Address",
        key: "Address",
      },
      {
        title: "Pin",
        dataIndex: "PIN",
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
      <h1>Step 1: Enter your address into the search bar.</h1>
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
      >
        <p style={{ width: "350px" }}>
          Enter your street number and street name.
        </p>

        <Input.Group compact>
          <Form.Item
            style={{ width: "100px" }}
            name="st_num"
            rules={[{ required: true, message: "Street name is required." }]}
          >
            <Input type="number" placeholder="number" />
          </Form.Item>
          <Form.Item
            style={{ width: "300px" }}
            name="st_name"
            rules={[{ required: true, message: "Street name is required." }]}
          >
            <Input placeholder="street" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Search
          </Button>
        </Input.Group>
      </Form>

      {pins.length !== 0 ? (
        <>
          <br />
          {submitted && (
            <h1>
              {" "}
              Step 2. Select your property from the table and then click “Get
              Sales Data.”
            </h1>
          )}
          <Table key={pins.PIN} columns={columns} dataSource={pins} />
          {submitted && (
            <p>
              After searching for your home, please hit <b>Select</b> next to
              your property
            </p>
          )}
        </>
      ) : submitted ? (
        "Your property could not be found. Please try searching again. NOTE: Homes which are NEZs cannot be processed by this tool."
      ) : null}
    </>
  )
}

PinLookup.propTypes = {
  logPin: PropTypes.func,
  logUuid: PropTypes.func,
  setRecord: PropTypes.func,
  setSelect: PropTypes.func,
  appealType: PropTypes.string,
}

export default PinLookup
