import { supabase } from './supabaseClient'

export async function createDocusealSubmission({ documentTitle, html, submitterName, submitterEmail }) {
  const { data, error } = await supabase.functions.invoke('docuseal-submission', {
    body: { documentTitle, html, submitterName, submitterEmail },
  })
  if (error) throw error
  return data.slug
}

const DOC_STYLES = `
  body { font-family: Georgia, serif; color: #1a1a1a; padding: 40px; line-height: 1.6; }
  h2 { font-size: 20px; margin-bottom: 4px; }
  .sub { color: #555; margin-bottom: 24px; }
  .row { margin-bottom: 10px; }
  .label { font-weight: bold; }
  .sign-block { margin-top: 48px; display: flex; gap: 32px; }
`

export function buildOfferHtml({ candidateName, jobTitle, salary, bonus, pto, startDate }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${DOC_STYLES}</style></head><body>
    <h2>Offer of Employment</h2>
    <div class="sub">Prepared for ${candidateName}</div>
    <div class="row"><span class="label">Role:</span> ${jobTitle}</div>
    <div class="row"><span class="label">Annual Salary:</span> $${Number(salary).toLocaleString()}</div>
    <div class="row"><span class="label">Bonus Target:</span> ${bonus}</div>
    <div class="row"><span class="label">PTO:</span> ${pto}</div>
    <div class="row"><span class="label">Start Date:</span> ${startDate || 'TBD'}</div>
    <p>By signing below, you accept the terms of this offer.</p>
    <div class="sign-block">
      <signature-field name="Signature" role="Signer" style="width: 220px; height: 60px;"></signature-field>
      <date-field name="Date" role="Signer" style="width: 140px; height: 30px;"></date-field>
    </div>
  </body></html>`
}

export function buildWotcConsentHtml({ candidateName }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${DOC_STYLES}</style></head><body>
    <h2>WOTC Screening Consent</h2>
    <div class="sub">${candidateName}</div>
    <p>I affirm that the information provided in the Work Opportunity Tax Credit screening
    is accurate to the best of my knowledge, and I consent to my responses being used
    solely for federal tax credit eligibility purposes. This has no effect on any hiring decision.</p>
    <div class="sign-block">
      <signature-field name="Signature" role="Signer" style="width: 220px; height: 60px;"></signature-field>
      <date-field name="Date" role="Signer" style="width: 140px; height: 30px;"></date-field>
    </div>
  </body></html>`
}
