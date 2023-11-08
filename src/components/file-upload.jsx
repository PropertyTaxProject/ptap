import React from "react"
import PropTypes from "prop-types"

import { Button, Upload } from "antd"
import axios from "axios"
import { createDirectUpload } from "../requests"

const mapImageObject = ({ name, response, url }) => ({
  name,
  url: url || response?.url,
})

export const FileUpload = ({ files, onChange }) => {
  return (
    <Upload
      listType="picture"
      defaultFileList={[...files]}
      onChange={({ fileList }) => onChange(fileList.map(mapImageObject))}
      customRequest={async ({ file, onError, onSuccess, onProgress }) => {
        const { url, fields } = await createDirectUpload(file.name)

        const options = {
          onUploadProgress: (event) => {
            onProgress(
              {
                percent: Math.round((event.loaded / event.total) * 100),
              },
              file
            )
          },
          headers: {
            "Content-Type": file.type,
          },
        }

        const form = new FormData()
        Object.keys(fields).forEach((key) => {
          form.append(key, fields[key])
        })
        form.append("file", file, file.name)
        const imageUrl = `${url}${fields.key}`

        axios
          .post(url, form, options)
          .then((result) => {
            onSuccess({ ...result, url: imageUrl }, file)
          })
          .catch(onError)
      }}
    >
      <Button>Click to upload</Button>
    </Upload>
  )
}

FileUpload.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
}
