import React, { useContext } from "react"
import { getPageLabel } from "../../utils"
import { Button, Divider, Form, Radio, Space, Input } from "antd"
import { FileUpload } from "../../components/file-upload"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"

const formItemLayout = {
  labelCol: {
    span: 16,
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    md: {
      span: 16,
    },
  },
}

const Damage = () => {
  const appeal = useContext(AppealContext)
  const dispatch = useContext(AppealDispatchContext)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  return (
    <>
      <h1>Damage</h1>
      <Form
        form={form}
        initialValues={appeal}
        name="damage"
        layout="vertical"
        autoComplete="off"
        size="large"
        {...formItemLayout}
      >
        <Form.Item
          name="damage_level"
          rules={[
            { required: true, message: "You must select one of the options" },
          ]}
          label="To the best of your abilities, please pick a category that best describes the condition of your home. The Assessor uses these categories and criteria to rate the condition."
        >
          <Radio.Group
            name="damage_level"
            onChange={(e) => {
              dispatch({
                type: "set-damage-level",
                damage_level: e.target.value,
              })
            }}
          >
            <Space direction="vertical">
              <Radio value="excellent">
                <strong>Excellent</strong>: Building is in perfect condition,
                very attractive and highly desirable
              </Radio>
              <Radio value="very_good">
                <strong>Very good</strong>: Slight evidence of deterioration,
                still attractive and quite desirable
              </Radio>
              <Radio value="good">
                <strong>Good</strong>: Minor deterioration visible, slightly
                less attractive and desirable, but useful
              </Radio>
              <Radio value="average">
                <strong>Average</strong>: Normal wear and tear is apparent,
                average attractiveness and desirability
              </Radio>
              <Radio value="fair">
                <strong>Fair</strong>: Marked deterioration, rather unattractive
                and undesirable but still quite useful
              </Radio>
              <Radio value="poor">
                <strong>Poor</strong>: Definite deterioration is obvious,
                definitely undesirable and barely usable
              </Radio>
              <Radio value="very_poor">
                <strong>Very poor</strong>: Condition approaches unsoundness,
                extremely undesirable and barely usable
              </Radio>
              <Radio value="unsound">
                <strong>Unsound</strong>: Building is definitely unsound and
                practically unfit for use
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <br />
        <Form.Item
          name="damage"
          rules={[{ required: true, message: "You must add a response" }]}
          label="Please describe the condition of your home and neighborhood below. Be sure to include any damage to your property, both inside and out."
        >
          <Input.TextArea
            name="damage"
            size="large"
            value={appeal.damage}
            onChange={(e) => {
              dispatch({ type: "set-damage", damage: e.target.value })
            }}
          />
        </Form.Item>

        {appeal.city !== "chicago" && (
          <>
            <h2>Upload images</h2>
            <p>
              Although optional, we encourage you to upload photos showing
              damage to the inside and outside of your home, as appeals that
              include photos are usually more effective.
            </p>
            <FileUpload
              label="Click to upload images of the damage (optional)"
              accept="image/*,.heic,.heif"
              files={appeal.files}
              onChange={(files) => dispatch({ type: "set-files", files })}
            />
          </>
        )}
      </Form>
      <Divider />
      <Space>
        <Button
          size="large"
          type="danger"
          onClick={() => navigate("../review-property")}
        >
          Back
        </Button>
        <Button
          size="large"
          type="primary"
          disabled={!appeal.damage_level}
          onClick={() => navigate("../review-appeal")}
        >
          Next Page
        </Button>
      </Space>
      <Divider />
      <p>{getPageLabel("damage")}</p>
    </>
  )
}

export default Damage
