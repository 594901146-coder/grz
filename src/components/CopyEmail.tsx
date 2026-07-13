import { useState } from 'react'
import Magnet from './reactbits/Magnet/Magnet'

const EMAIL = 'fkxqsvivo500@gmail.com'

export function CopyEmail() {
  const [copied, setCopied] = useState(false)

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <div className="contact-actions">
      <Magnet padding={72} magnetStrength={5} wrapperClassName="contact-magnet">
        <a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </Magnet>
      <button className="copy-button" type="button" onClick={copyAddress} aria-live="polite">
        {copied ? '已复制 ✓' : '复制邮箱'}
      </button>
    </div>
  )
}
