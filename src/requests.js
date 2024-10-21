import axios from "axios"

const BASE_URL = document.querySelector("meta[name=baseurl]").content || ""

export const submitForm = async (info) => {
  try {
    if (info.selected_comparables) {
      info.selected_comparables = info.selected_comparables.map(
        ({ pin }) => pin
      )
    }
    const resp = await axios.post(`${BASE_URL}/api/user-form`, info)
    return resp.data
  } catch (e) {
    console.error(e)
    return null
  }
}

export const submitAppeal = async (appeal) => {
  try {
    const body = { ...appeal }
    body.selected_comparables = body.selected_comparables.map(({ pin }) => pin)
    await axios.post(`${BASE_URL}/api/submit-appeal`, body, {
      responseType: "json",
    })
  } catch (e) {
    console.error(e)
  }
}

export const submitAgreement = async (data) => {
  const res = await axios.post(`${BASE_URL}/api/agreement`, data, {
    responseType: "json",
  })
  return res.data
}

export const lookupPin = async (region, address) => {
  try {
    const resp = await axios.get(
      `${BASE_URL}/api/search-pin/${region}/${address}`
    )
    return resp.data
  } catch (err) {
    return []
  }
}

export const createDirectUpload = async (filename) => {
  return (await axios.post(`${BASE_URL}/api/upload`, { filename })).data
}
