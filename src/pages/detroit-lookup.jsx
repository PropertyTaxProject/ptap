import React, { useEffect, useState } from "react"
import PinLookup from "../components/pin-lookup"
import PinChooser from "../components/pin-chooser"
import { Button, Divider } from "antd"
import { DISPLAY_FIELDS } from "../utils"
import { lookupComparables } from "../requests"
import { Table } from "antd"

function jsonToCsv(items) {
  if (!items.length) return ""

  const headers = Object.keys(items[0])

  const escapeValue = (value) => {
    if (value == null) return ""
    const stringValue = String(value)
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  const csvRows = [
    headers.join(","),
    ...items.map((row) =>
      headers.map((header) => escapeValue(row[header])).join(",")
    ),
  ]

  return csvRows.join("\n")
}

function downloadCsv(jsonData, filename = "data.csv") {
  const csv = jsonToCsv(jsonData)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

const DetroitLookup = () => {
  const [pin, setPin] = useState(null)
  const [searchProperties, setSearchProperties] = useState([])
  const [comparables, setComparables] = useState([])

  useEffect(() => {
    if (!pin) return

    lookupComparables("detroit", pin).then((res) => {
      setComparables(res.comparables || [])
    })
  }, [pin])

  return (
    <>
      <PinLookup
        region={"detroit"}
        onSearch={({ search_properties }) =>
          setSearchProperties(search_properties)
        }
      />
      {searchProperties.length > 0 && (
        <>
          <br />
          <PinChooser
            headers={[
              {
                title: "Address",
                field: "address",
              },
              {
                title: "PIN",
                field: "pin",
              },
            ]}
            propertyOptions={searchProperties}
            max={1}
            isSelectLabels
            onChange={setPin}
            pins={pin ? [pin] : []}
          />
          {pin && (
            <>
              <br />
              <Button
                danger
                onClick={() => {
                  setPin(null)
                }}
              >
                Reset chosen address
              </Button>
            </>
          )}
        </>
      )}
      <Divider />
      <Table
        dataSource={comparables.map(({ pin, ...data }) => ({
          ...data,
          pin,
          key: pin,
        }))}
        scroll={{ x: true }}
      >
        {DISPLAY_FIELDS.map(({ title, field }) => (
          <Table.Column title={title} dataIndex={field} key={field} />
        ))}
      </Table>
      <br />
      <Button
        type="primary"
        disabled={comparables.length === 0}
        onClick={() => downloadCsv(comparables, `comparables-${pin}.csv`)}
      >
        Download spreadsheet
      </Button>
    </>
  )
}

export default DetroitLookup
