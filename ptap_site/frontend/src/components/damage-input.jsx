import React from 'react';
import {
  Form,
  Input,
  Radio,
  Button,
  Row,
  Col,
  Select,
  Card,
  Space,
  Upload,
  message,
} from 'antd';
import ImageWall from './image-upload';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const { TextArea } = Input;

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 20,
    },
    md: {
      span: 18,
    },
    lg: {
      span: 14,
    },
  },
};


function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG files!');
  }
  const isLt8M = file.size / 1024 / 1024 < 8;
  if (!isLt8M) {
    message.error('Image must smaller than 8MB!');
  }
  return isJpgOrPng && isLt8M;
}

class Avatar extends React.Component {
  state = {
    loading: false,
  };

  handleChange = info => {
    if (info.file.status === 'uploading') {const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 24,
          offset: 0,
        },
      },
    };
    
    
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState({
          imageUrl,
          loading: false,
        }),
      );
    }
  };

  render() {
    const uploadButton = (
      <div style={{width: '330px'}}>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="UPLOAD URL"
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    );
  }
}

const CardBody = (props) => {
  const {id} = props;

  return (
    <Card
      title={(
        <Form.Item name={`damage_type_${id}`} label="Damage Type" noStyle rules={[{ required: true }]}>
          <Select
            style={{width: '350px'}}
            placeholder="Select a option and change input text above"
            onChange={() => {console.log(id)}}
          >
            <Option value="garage">Garage Damage</Option>
            <Option value="roof">Water Damage</Option>
            <Option value="water">Roof Damage</Option>
          </Select>
        </Form.Item>
)}
      style={{ width: '400px' }}
    >
      <DamageInput id={id}/>
    </Card>
  );
};

const DamageInput = (props) => {
  const a = 0;
  return (
    <>
      <Form.Item
        name={`damage_description_${props.id}`}
        label="Damage Description"
        rules={[
          {
            required: true,
            message: 'Please add a description of your damage.',
            whitespace: true,
          },
        ]}
        noStyle
      >
        <TextArea rows={4} placeholder="Please provide any details regarding the damage." />
      </Form.Item>
      <br/>
      <br/>
      <p>Please upload any images of the damage.</p>
      <Form.Item
        name={`damage_image_${props.id}`}
        label="Damage Image"
        rules={[
          {
            required: true,
            message: 'Please input damage information!',
            whitespace: true,
          },
        ]}
        noStyle
      >
        <Avatar></Avatar>
      </Form.Item>
    </>
  );
};

export default CardBody;
