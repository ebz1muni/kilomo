import { NextRequest, NextResponse } from 'next/server';

type SMSPayload = {
  to: string;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    const { to, message }: SMSPayload = await req.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing 'to' or 'message' field." },
        { status: 400 }
      );
    }

    // 🧪 Simulated SMS send (stubbed for now)
    console.log(`[SMS-STUB] To: ${to}, Message Preview: ${message.slice(0, 50)}...`);

    // 🔧 TODO: Replace this block with actual UltraMsg or Twilio integration
    // Example UltraMsg fetch:
    // await fetch('https://api.ultramsg.com/instanceID/messages/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     token: process.env.ULTRAMSG_TOKEN!,
    //     to,
    //     body: message,
    //   }),
    // });

    return NextResponse.json({
      success: true,
      message: 'SMS sending is currently disabled (stub).',
    });
  } catch (error: any) {
    console.error('[send-sms-error]', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
