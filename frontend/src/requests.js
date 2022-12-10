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

export const submitAppeal = async (targetProperty, comparables, userInfo, userPropInfo, uuid) => {
  try {
    const body = { target_pin: targetProperty, comparables, uuid, ...userInfo, ...userPropInfo };
    console.log(body);
    //const detroit = userInfo.appeal_type === 'detroit_single_family';
    const download = false;
    const resp = await axios.post('/api_v1/submit2', body, { responseType: download ? 'blob' : 'json' });
    if (download === true) {
      saveAs(resp.data, `${userInfo.name.split(' ').join('-').toLowerCase()}-appeal.docx`);
    } else {
      console.log(resp);
    }
  } catch (e) {
    console.error(e);
  }
};

export const submitEstimate = async (targetProperty, uuid, comparablesPool, selectedComparables) => {
  let today = new Date()
  let date = today.getDate() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getFullYear()
  try {
    const body = { target_pin: targetProperty, comparablesPool, uuid, selectedComparables };
    const download = true;
    const resp = await axios.post('/api_v1/estimates', body, { responseType: download ? 'blob' : 'json' });
    if (download === true) {
      saveAs(resp.data, `${targetProperty.Address + ' ' + date} Appendix.docx`);
    } else {
      console.log(resp);
    }
  } catch (e) {
    console.error(e);
  }
};

export const lookupPin = async (data) => {
  try {
    const resp = await axios.post('/api_v1/pin-lookup', data)
    return resp.data.response;
  } catch (err) {
    return [];
  }
};

export const estimatePin = async (data) => {
  try {
    const resp = await axios.post('/api_v1/submit2', data)
    return resp.data.response;
  } catch (err) {
    return [];
  }
}