/**
 * Sends a sample booking request + patient acknowledgement so you can
 * confirm SMTP delivery without filling in the website form.
 *
 *   npm run mail:test                  → patient copy goes to MAIL_TO
 *   npm run mail:test -- you@mail.com  → patient copy goes to that address
 *
 * Requires SMTP_HOST, MAIL_FROM and MAIL_TO in .env (see .env.example).
 */
import { env, smtpConfigured } from './env.ts'
import { sendClinicNotification, sendPatientConfirmation, verifyTransport, type AppointmentRequest } from './mailer.ts'

async function main() {
  if (!smtpConfigured) {
    console.error(
      'SMTP is not configured. Fill in SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM and MAIL_TO in .env, then run again.',
    )
    process.exit(1)
  }

  const patientAddress = process.argv[2] ?? env.mail.to[0]
  const inThreeDays = new Date()
  inThreeDays.setDate(inThreeDays.getDate() + 3)

  const sample: AppointmentRequest = {
    fullName: 'Test Patient',
    phone: '+91 98765 43210',
    email: patientAddress,
    preferredDate: inThreeDays.toISOString().slice(0, 10),
    preferredTime: 'Morning',
    treatment: 'General consultation',
    message: 'This is a test message sent by `npm run mail:test`.',
    reference: `TEST-${Date.now().toString(36).toUpperCase()}`,
    receivedAt: new Date(),
    ip: 'local',
  }

  console.log(`Verifying SMTP connection to ${env.smtp.host}:${env.smtp.port} …`)
  await verifyTransport()

  console.log(`Sending clinic notification → ${env.mail.to.join(', ')}`)
  const clinic = await sendClinicNotification(sample)
  console.log(`  accepted: ${JSON.stringify(clinic.accepted)} id: ${clinic.messageId}`)

  console.log(`Sending patient acknowledgement → ${patientAddress}`)
  const patient = await sendPatientConfirmation(sample)
  console.log(`  accepted: ${JSON.stringify(patient.accepted)} id: ${patient.messageId}`)

  console.log('\nDone — check both inboxes (and the spam folder the first time).')
}

main().catch((err) => {
  console.error('\nMail test failed:', err instanceof Error ? err.message : err)
  console.error('Common causes: wrong SMTP_PASS (Gmail needs an App Password, not your login password), wrong port/SMTP_SECURE pairing (465 → true, 587 → false), or MAIL_FROM not permitted by the provider.')
  process.exit(1)
})
