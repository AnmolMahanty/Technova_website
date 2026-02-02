import QRCode from 'qrcode';

/**
 * Generate QR code from data
 * Note: QR data must be obtained from backend (signed payload)
 * This function only converts the data to QR image
 * 
 * @param {object} qrData - Signed QR data from backend
 * @returns {Promise<string>} Data URL of QR code image
 */
export const generateQRCode = async (qrData) => {
  try {
    const dataString = JSON.stringify(qrData);
    const qrDataUrl = await QRCode.toDataURL(dataString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

export default { generateQRCode };
