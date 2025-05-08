import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import puppeteer from 'puppeteer';
import { Buffer } from 'buffer';
import { notifyFuelTheft } from '../../../api/stats/notifications/whatsappService';

const resend = new Resend(process.env.RESEND_API_KEY!);

type FuelLog = {
  generator: string;
  fuelUsed: number;
  runtime: number;
  suspicious?: boolean;
};

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      body = {
        stats: {
          totalFuelUsage: 120,
          activeGenerators: 2,
          totalGenerators: 3,
          riskScore: 42,
        },
        logs: [
          { generator: 'Gen A', fuelUsed: 50, runtime: 5 },
          { generator: 'Gen B', fuelUsed: 70, runtime: 6, suspicious: true },
        ],
        to: 'ebaloshabani31@gmail.com',
      };
    }

    const { stats, logs, to }: { stats: any; logs: FuelLog[]; to?: string } = body;

    if (!stats || !logs) {
      return NextResponse.json(
        { error: 'Missing required report data (stats or logs).' },
        { status: 400 }
      );
    }

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; }
            .section { margin-bottom: 20px; }
            .log { margin-left: 10px; }
          </style>
        </head>
        <body>
          <h1>Kilomo Fuel Report</h1>
          <div class="section">
            <h2>Overview</h2>
            <p><strong>Total Fuel Usage:</strong> ${stats.totalFuelUsage}L</p>
            <p><strong>Generators Active:</strong> ${stats.activeGenerators}/${stats.totalGenerators}</p>
            <p><strong>Risk Score:</strong> ${stats.riskScore}%</p>
          </div>
          <div class="section">
            <h2>Logs</h2>
            <ul>
              ${logs
                .map(
                  (log) => `
                    <li class="log">
                      ${log.generator}: ${log.fuelUsed}L / ${log.runtime}hrs 
                      ${log.suspicious ? '⚠️ <strong>Suspicious</strong>' : ''}
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const data = await resend.emails.send({
      from: 'reports@kilomo.ai',
      to: to || 'ebaloshabani31@gmail.com',
      subject: 'Your Kilomo Weekly Report',
      html: '<p>Attached is your Kilomo fuel report 🚀</p>',
      attachments: [
        {
          filename: `kilomo_report_${Date.now()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    });

    await sendWeeklyReport(stats);

    return NextResponse.json({ success: true, message: 'Email and WhatsApp sent!', data });
  } catch (error: any) {
    console.error('[send-report-error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function sendWeeklyReport(stats: any) {
  const { totalFuelUsage, activeGenerators, totalGenerators, riskScore } = stats;

  const message = `
🚨 Kilomo Weekly Report 🚨
Total Fuel Usage: ${totalFuelUsage}L
Active Generators: ${activeGenerators}/${totalGenerators}
Risk Score: ${riskScore}%
  `;

  try {
    await notifyFuelTheft(message);
    console.log('WhatsApp notification sent successfully.');
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    throw new Error('Failed to send WhatsApp notification.');
  }
}
