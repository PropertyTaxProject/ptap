import axios from 'axios';
import { saveAs } from 'file-saver';

export const submitForm = async (info) => {
  try {
    const resp = await axios.post('/api_v1/submit', info);
    console.log(resp);
    return resp.data.response;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const submitAppeal = async (targetProperty, comparables, userInfo, uuid) => {
  try {
    const body = { target_pin: targetProperty, comparables, uuid, ...userInfo };
    console.log(body);
    //const detroit = userInfo.appeal_type === 'detroit_single_family'; TEMPORARY DOWNLOAD ALL
    const detroit = true;
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
