'use server'

export async function sendFeedback(formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const message = formData.get('message')

  // In a real application, you would use a service like Resend, Nodemailer, or SendGrid here.
  // For demonstration, we will log the data that would be sent to m_rabi@strategisthub.com
  console.log('--- NEW FEEDBACK RECEIVED ---')
  console.log(`To: m_rabi@strategisthub.com`)
  console.log(`From: ${name} (${email})`)
  console.log(`Message: ${message}`)
  console.log('-----------------------------')

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return { success: true }
}
