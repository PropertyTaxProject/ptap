import React, { useContext } from "react"
import { getPageLabel } from "../../utils"
import { Button, Divider, Form, Radio, Space, Input, Checkbox } from "antd"
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
      {appeal.resumed && (
        <div>
          <p>
            <strong>Age</strong>: {appeal.target.age}
          </p>
          <p>
            <strong>Effective Age</strong>: {appeal.target.effective_age}
          </p>
        </div>
      )}
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
          label="Please describe the condition of your home and neighborhood below. Be sure to include: (1) any damage to your property, both inside and out; and (2) any neighborhood characteristics that may lower your property’s value (for example, lots of vacant homes, nearby polluting factory, dumping, etc.). "
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

        {appeal.region !== "chicago" && (
          <>
            <h2>Upload images</h2>
            <p>
              We encourage you to upload photos showing damage to the inside and
              outside of your home because appeals that include photos are more
              effective. No neighborhood photos are necessary.
            </p>
            <FileUpload
              label="Click to upload images of the damage (optional)"
              accept="image/*,.heic,.heif"
              files={appeal.files}
              onChange={(files) => dispatch({ type: "set-files", files })}
            />
          </>
        )}
        {appeal.resumed && appeal.region === "detroit" && (
          <p>
            <br />
            <Checkbox
              name="economic_obsolescence"
              checked={appeal.economic_obsolescence}
              onChange={(e) => {
                dispatch({
                  type: "set-economic-obsolescence",
                  economic_obsolescence: e.target.checked,
                })
              }}
            >
              Include Economic Obsolescence argument
            </Checkbox>
          </p>
        )}
      </Form>
      <Divider />
      <Space>
        <Button
          size="large"
          type="danger"
          onClick={() =>
            navigate(
              appeal.region === "detroit" && !appeal.resumed
                ? "../review-property"
                : "../comparables"
            )
          }
        >
          Back
        </Button>
        <Button
          size="large"
          type="primary"
          disabled={!appeal.damage_level || !appeal.damage}
          onClick={() => navigate("../review-appeal")}
        >
          Next Page
        </Button>
      </Space>
      <Divider />
      <p>{getPageLabel("damage", appeal)}</p>
    </>
  )
}

export default Damage
