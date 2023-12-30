import React, { useContext } from "react"
import { CONTACT_EMAIL } from "../../utils"
import { Button, Divider, Form, Radio, Space, Input } from "antd"
import { FileUpload } from "../../components/file-upload"
import { AppealContext, AppealDispatchContext } from "../../context/appeal"
import { useNavigate } from "react-router-dom"
const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    md: {
      span: 12,
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
          help={`If you have any questions about how to categorize your home, please send us an email at ${CONTACT_EMAIL}.`}
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
          label="In support of the rating you selected for your home above, please describe the condition of your home below, including any damage to your property, both inside and out."
        >
          <Input.TextArea
            name="damage"
            value={appeal.damage}
            onChange={(e) => {
              dispatch({ type: "set-damage", damage: e.target.value })
            }}
          />
        </Form.Item>

        {appeal.city !== "chicago" && (
          <FileUpload
            label="Click to upload images of the damage"
            accept="image/*,.heic,.heif"
            files={appeal.files}
            onChange={(files) => dispatch({ type: "set-files", files })}
          />
        )}
      </Form>
      <Divider />
      <Space>
        <Button
          size="large"
          type="danger"
          onClick={() => navigate("../comparables")}
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
      <p>Page 6 of 7</p>
    </>
  )
}

export default Damage
