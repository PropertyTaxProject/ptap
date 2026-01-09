import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses"

const s3 = new S3Client({})
const ses = new SESClient({})

function rewriteHeaders(raw, from, replyTo) {
  // Split headers and body at the first empty line (double newline)
  const [headerBlock, ...bodyParts] = raw.split(/(?:\r\n\r\n|\n\n)/)
  const body = bodyParts.join("\r\n\r\n")
  const lines = headerBlock.split(/\r?\n/)
  const newHeaders = []
  let skip = false

  for (const line of lines) {
    if (/^(From|Reply-To|Sender|Return-Path):/i.test(line)) {
      skip = true
      continue
    }
    if (skip && /^\s/.test(line)) {
      continue
    }
    skip = false
    newHeaders.push(line)
  }

  // Append new headers
  newHeaders.push(`From: ${from}`)

  // Only add Reply-To if it's not empty
  if (replyTo && replyTo.trim() !== "") {
    newHeaders.push(`Reply-To: ${replyTo}`)
  }

  // Extract email from <...> or use raw from
  const senderEmailMatch = from.match(/<(.+?)>/)
  const senderEmail = senderEmailMatch ? senderEmailMatch[1] : from
  newHeaders.push(`Sender: ${senderEmail}`)

  console.log(JSON.stringify(newHeaders, null, 2))
  return `${newHeaders.join("\r\n")}\r\n\r\n${body}`
}

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  const record = event.Records[0]

  const messageId = record.ses.mail.messageId
  const key = `${process.env.S3_PREFIX}${messageId}`
  const originalFrom = record.ses.mail.source

  console.log(`${process.env.S3_BUCKET}/${key}`)
  const response = await s3.send(
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
  )

  const chunks = []
  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }
  const rawEmail = Buffer.concat(chunks).toString("utf-8")

  const rewritten = rewriteHeaders(
    rawEmail,
    process.env.SENDER_EMAIL,
    originalFrom
  )

  await ses.send(
    new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(rewritten, "utf-8") },
      Destinations: [process.env.FORWARD_EMAIL],
      Source: process.env.SENDER_EMAIL,
    })
  )
}
