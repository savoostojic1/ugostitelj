import "server-only";
import QRCode from "qrcode";

const DEFAULT_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  width: 512,
  color: {
    dark: "#111111",
    light: "#ffffff",
  },
};

export async function generateGuideQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    ...DEFAULT_OPTIONS,
    type: "image/png",
  });
}

export async function generateGuideQrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    ...DEFAULT_OPTIONS,
    type: "png",
  });
}
