import https from 'https';
import qs from 'querystring';
import fs from 'fs';

const API_TOKEN = 'qaj9fzz1m3wkt9qe';
const INSTANCE_ID = 'instance117164'; // UltraMsg instance ID

// Default fallback numbers (you'll fetch dynamic ones from Firebase later)
const factoryNumbers: string[] = ['+44 7442 737711'];

// 📤 Send a plain text WhatsApp message
export function sendWhatsAppMessage(to: string, message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = qs.stringify({
      token: API_TOKEN,
      to,
      body: message,
    });

    const options: https.RequestOptions = {
      hostname: 'api.ultramsg.com',
      port: 443,
      path: `/${INSTANCE_ID}/messages/chat`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Uint8Array[] = [];

      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          const json = JSON.parse(body);
          if (json.error) {
            console.error(`❌ API error:`, json);
            return reject(new Error(json.error));
          }
          console.log(`✅ WhatsApp text sent to ${to}:`, json);
          resolve(body);
        } catch {
          console.warn('⚠️ Non-JSON response:', body);
          resolve(body); // resolve anyway
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error sending to ${to}:`, error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 📤 Send a media message (image via public URL or base64 as file upload)
export function sendWhatsAppImage(to: string, imagePath: string, caption: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(imagePath);
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

    const postDataParts = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="token"`,
      '',
      API_TOKEN,
      `--${boundary}`,
      `Content-Disposition: form-data; name="to"`,
      '',
      to,
      `--${boundary}`,
      `Content-Disposition: form-data; name="caption"`,
      '',
      caption,
      `--${boundary}`,
      `Content-Disposition: form-data; name="image"; filename="report.jpg"`,
      'Content-Type: image/jpeg',
      '',
    ];

    const postFooter = `\r\n--${boundary}--\r\n`;
    const postDataHeader = postDataParts.join('\r\n') + '\r\n';

    const options: https.RequestOptions = {
      hostname: 'api.ultramsg.com',
      port: 443,
      path: `/${INSTANCE_ID}/messages/image`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          const json = JSON.parse(body);
          console.log(`✅ WhatsApp image sent to ${to}:`, json);
          resolve(body);
        } catch {
          console.warn('⚠️ Non-JSON response:', body);
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Image send error to ${to}:`, error.message);
      reject(error);
    });

    req.write(postDataHeader);
    fileStream.pipe(req, { end: false });
    fileStream.on('end', () => {
      req.end(postFooter);
    });
  });
}

// 🚀 Send a message (and optional image) to multiple numbers
export async function notifyFuelTheft(
  message: string,
  imagePath?: string,
  customNumbers?: string[]
): Promise<void> {
  const recipients = customNumbers || factoryNumbers;

  for (const number of recipients) {
    try {
      if (imagePath) {
        await sendWhatsAppImage(number, imagePath, message);
      } else {
        await sendWhatsAppMessage(number, message);
      }
    } catch (err) {
      console.error(`❌ Failed to send alert to ${number}:`, (err as Error).message);
    }
  }
}
// 📤 Send a PDF report (stubbed for now)