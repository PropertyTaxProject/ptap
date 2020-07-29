import axios from 'axios';
import { saveAs } from 'file-saver';

export const submitForm = async (info, setData, setInfo) => {
  try {
    const resp = await axios.post('/api_v1/submit', info);
    console.log(resp);
    const data = resp.data.response.target_pin.concat(resp.data.response.comparables);
    setData(data);
    setInfo(info);
  } catch (e) {
    console.error(e);
  }
};

export const submitAppeal = async (data, userInfo) => {
  try {
    // merge our data and user info
    const targetPin = [data[0]];
    const comparables = data.slice(1);
    const body = { target_pin: targetPin, comparables, ...userInfo };
    console.log(body);
    const detroit = userInfo.appeal_type === 'detroit_single_family';
    const resp = await axios.post('/api_v1/submit2', body, { responseType: detroit ? 'blob' : 'json' }); // detroit downloads file, chicago returns json
    if (detroit) {
      saveAs(resp.data, `${userInfo.name.split(' ').join('-').toLowerCase()}-appeal.docx`);
    } else {
      console.log(resp);
    }
    // TRIGGER SUBMISSION PAGE
  } catch (e) {
    console.error(e);
  }
};
