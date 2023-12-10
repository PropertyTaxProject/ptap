import axios from "axios"
import { saveAs } from "file-saver"

const BASE_URL = document.querySelector("meta[name=baseurl]").content || ""

export const submitForm = async (info) => {
  try {
    const resp = await axios.post(`${BASE_URL}/api_v1/submit`, info)
    return resp.data.response
  } catch (e) {
    console.error(e)
    return null
  }
}

export const submitAppeal = async ({
  target,
  selectedComparables: comparables,
  user,
  userProperty,
  uuid,
  damage = ``,
  files = [],
}) => {
  try {
    const body = {
      target_pin: target,
      comparables,
      uuid,
      damage,
      files,
      ...user,
      ...userProperty,
    }
    //const detroit = userInfo.appeal_type === 'detroit_single_family';
    const download = false
    const resp = await axios.post(`${BASE_URL}/api_v1/submit2`, body, {
      responseType: download ? "blob" : "json",
    })
    if (download === true) {
      saveAs(
        resp.data,
        `${user.name.split(" ").join("-").toLowerCase()}-appeal.docx`
      )
    } else {
      console.log(resp)
    }
  } catch (e) {
    console.error(e)
  }
}

export const submitEstimate = async (
  parcel,
  uuid,
  comparablesPool,
  selectedComparables,
  files = []
) => {
  let today = new Date()
  let date =
    today.getDate() +
    "-" +
    parseInt(today.getMonth() + 1) +
    "-" +
    today.getFullYear()
  try {
    const body = {
      target_pin: parcel,
      comparablesPool,
      uuid,
      selectedComparables,
      files,
    }
    const download = true
    const resp = await axios.post(`${BASE_URL}/api_v1/estimates`, body, {
      responseType: download ? "blob" : "json",
    })
    if (download === true) {
      saveAs(
        resp.data,
        `${parcel.street_number}_${parcel.street_name}_${date}_Appendix.docx`
      )
    } else {
      console.log(resp)
    }
  } catch (e) {
    console.error(e)
  }
}

export const submitEstimate2 = async (
  targetProperty,
  uuid,
  comparablesPool,
  selectedComparables
) => {
  try {
    const body = {
      target_pin: targetProperty,
      comparablesPool,
      uuid,
      selectedComparables,
    }
    const resp = await axios.post(`${BASE_URL}/api_v1/estimates2`, body)
    return resp.data.response
  } catch (e) {
    console.error(e)
  }
}

export const lookupPin = async (data) => {
  try {
    const resp = await axios.post(`${BASE_URL}/api_v1/pin-lookup`, data)
    return resp.data.response
  } catch (err) {
    return []
  }
}

export const estimatePin = async (data) => {
  try {
    const resp = await axios.post(`${BASE_URL}/api_v1/submit2`, data)
    return resp.data.response
  } catch (err) {
    return []
  }
}

export const createDirectUpload = async (filename) => {
  return (await axios.post(`${BASE_URL}/api/upload`, { filename })).data
}
