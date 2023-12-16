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
  damage_level = ``,
  damage = ``,
  files = [],
}) => {
  try {
    const body = {
      target_pin: target,
      comparables,
      uuid,
      damage_level,
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

export const lookupPin = async (data) => {
  try {
    const resp = await axios.post(`${BASE_URL}/api_v1/pin-lookup`, data)
    return resp.data.response
  } catch (err) {
    return []
  }
}

export const createDirectUpload = async (filename) => {
  return (await axios.post(`${BASE_URL}/api/upload`, { filename })).data
}
