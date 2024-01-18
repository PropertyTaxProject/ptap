import axios from "axios"

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

export const submitAppeal = async (appeal) => {
  try {
    // TODO: Clean this up
    const { target, user, userProperty, ...data } = appeal
    const body = {
      target_pin: target,
      user,
      userProperty,
      ...data,
      ...user,
      ...userProperty,
    }
    await axios.post(`${BASE_URL}/api_v1/submit2`, body, {
      responseType: "json",
    })
  } catch (e) {
    console.error(e)
  }
}

export const submitAgreement = async ({
  uuid,
  agreement,
  agreement_name,
  user,
  pin,
  region,
  ...data
}) => {
  const res = await axios.post(
    `${BASE_URL}/api/agreement`,
    { uuid, agreement, agreement_name, user, pin, region, ...data },
    { responseType: "json" }
  )
  return res.data
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
