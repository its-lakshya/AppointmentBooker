import { Resend } from 'resend'
import Welcome from '@/emails/Welcome'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export const POST = async () => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: '21csaiml009@jssaten.ac.in',
      subject: 'Hello World',
      react: Welcome(),
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}