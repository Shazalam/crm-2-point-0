export interface BookingTemplateData {
  _id?: string; // Optional booking ID
  fullName: string;
  email?: string;
  phoneNumber?: string;
  rentalCompany?: string;
  vehicleImage?: string;
  vehicleType?: string;
  total?: string;
  mco?: string;
  payableAtPickup?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  cardLast4?: string;
  expiration?: string;
  cardExpiry?: string;
  billingAddress?: string;
  salesAgent?: string;
  confirmationNumber?: string;
  modificationMCO?: string;

  // ✅ Refund-specific
  refundAmount?: string;
  processingFee?: string;
}



export const refundTemplate = (data: BookingTemplateData) => {
  const html = `
  <div style="margin:0;padding:0;background:#f5f7fb;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#dc2626;color:#ffffff;padding:18px 20px;text-align:center;">
                <div style="font-size:20px;font-weight:700;line-height:1.2;">🚗 BookFlyDriveStay</div>
                <div style="font-size:13px;margin-top:4px;">Refund Confirmation</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:20px 20px 8px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 10px;font-size:15px;">Dear <strong>${data.fullName}</strong>,</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                  We hope you are doing well.
                </p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                  This is to confirm that a refund of <strong>$${Number(data.refundAmount || 0).toFixed(2)} USD</strong> 
                  has been initiated for your <strong>${data.rentalCompany || "Car Rental Partner"}</strong> reservation 
                  (Confirmation #${data.confirmationNumber || "—"}), originally scheduled for pickup on 
                  ${data.pickupDate || "—"} ${data.pickupTime ? `at ${data.pickupTime}` : ""} 
                  at the ${data.rentalCompany || "Car Rental Partner"}, ${data.pickupLocation || "—"} location.
                </p>

                <!-- Payment Summary -->
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
                  <div style="font-size:15px;font-weight:700;margin-bottom:8px;">💳 Refund Summary</div>
                  <div style="font-size:14px;line-height:1.6;">
                    <div><strong>Processing Fee:</strong> $${Number(data.processingFee || 0).toFixed(2)} USD</div>
                    <div><strong>Refunded:</strong> $${Number(data.refundAmount || 0).toFixed(2)} USD</div>
                  </div>
                </div>

                <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
                  Please allow 5–7 business days for the refund to reflect on your account, depending on your bank or card issuer.
                </p>

                <!-- Closing -->
                <p style="margin:16px 0 0;font-size:14px;line-height:1.6;">
                  Thanks & Regards,<br/>
                  <strong style="color:#0f740f;">${data.salesAgent || "Reservations Desk"}</strong><br/>
                  BookFlyDriveStay
                </p>

                <!-- DocuSign Button -->
                
<div style="text-align:center;margin:24px 0;">
  <a href="https://www.nationfirstchoice.com/docusign?name=${data.fullName}&bookingId=${data._id || ''}" 
     style="display:inline-block;
            padding:14px 24px;
            background: linear-gradient(90deg, #4f46e5, #3b82f6);
            color:#ffffff;
            font-size:16px;
            font-weight:bold;
            text-decoration:none;
            border-radius:8px;
            box-shadow:0 4px 14px rgba(0,0,0,0.1);
            transition:all 0.3s ease;">
    📝 Complete DocuSign Form
  </a>
</div>

                  <!-- Closing -->
                  <!-- [START] CORRECTED SIGNATURE AND CONTACT INFO -->
                <div style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
                                    
                  <!-- Styled Horizontal Rule -->
                  <hr style="width:100%; border:0; border-top:1px solid #e0e0e0; margin:3px 0;" />
                  
                  <p style="margin:0;">
                    <strong style="color:#111827;">Toll-free (24/7):</strong> +1 (855) 613-3131
                  </p>
                </div>
              </td>
            </tr>

           

            <!-- Footer -->
            <tr>
              <td style="background:#f3f4f6;padding:14px 18px;text-align:center;color:#6b7280;font-size:12px;">
                © ${new Date().getFullYear()} BookFlyDriveStay • Toll-free (24/7): +1 (855) 613-3131
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
  const subject = `${data.rentalCompany || ""} - Refund Confirmation #${data.confirmationNumber || ""}`;

  return { subject, html };
};
