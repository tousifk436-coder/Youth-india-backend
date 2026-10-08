import https from "https";
import axios from "axios";

/**
 * Sends the OTP.
 *   OTP_CHANNEL=whatsapp  -> WhatsApp gateway (WHATSAPP_OTP_URL + WHATSAPP_AUTHKEY in .env)
 *   otherwise             -> printed in the server log (development)
 */
export const sendOTP = async (phone, otp) => {
  if (process.env.OTP_CHANNEL === "whatsapp") {
    return sendWhatsappOTP(phone, otp);
  }
  console.log(`[OTP] ${otp} for phone ${phone}`);
  return null;
};

const agent = new https.Agent({
  rejectUnauthorized: process.env.WHATSAPP_INSECURE_TLS === "true" ? false : true,
});

export const sendWhatsappOTP = async (phone, otp) => {
  const base = process.env.WHATSAPP_OTP_URL || "http://wa.techrush.in/api/http-authkey.php";
  const authkey = process.env.WHATSAPP_AUTHKEY;
  if (!authkey) {
    console.error("WHATSAPP_AUTHKEY is not set – OTP not sent");
    return null;
  }

  try {
    const message = `Dear Customer, Your Mobile Verification OTP is: ${otp}. Please enter this OTP to verify your mobile number.`;
    const number = String(phone).replace(/\D/g, "").slice(-10);
    const fullUrl =
      `${base}?authkey=${encodeURIComponent(authkey)}&route=${encodeURIComponent(process.env.WHATSAPP_ROUTE || "2")}` +
      `&number=91${number}&message=${encodeURIComponent(message)}`;

    const response = await axios.post(fullUrl, {}, { httpsAgent: agent, timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error(`Failed to send WhatsApp OTP to ${phone}:`, error.message);
    return null;
  }
};
