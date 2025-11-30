export interface GiftCardTemplateData {
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

  // ✅ Voucher-specific
  amount?: string;
  giftCode?: string;
  expirationDate?: string;
}

export const giftCardTemplate = (data: GiftCardTemplateData) => {
  const { fullName, giftCode, amount, expirationDate } = data;

  const html = `
  <div style="min-height:100vh;background:linear-gradient(to bottom right,#ebf4ff,#e0e7ff);display:flex;align-items:center;justify-content:center;padding:24px;">
    <div style="width:100%;max-width:640px;">
      <div style="background:white;box-shadow:0 10px 25px rgba(0,0,0,0.1);border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        
        <!-- Credit Card Style -->
        <div style="background:linear-gradient(to bottom right,#1e3a8a,#312e81);color:white;padding:32px;position:relative;">
          
          <!-- Card Chip -->
          <div style="position:absolute;top:20px;right:20px;width:48px;height:32px;background:linear-gradient(to right,#facc15,#fde047);border-radius:6px;"></div>
          
          <!-- Card Brand -->
          <div style="position:absolute;top:20px;left:20px;font-size:20px;font-weight:bold;opacity:0.8;">GIFT CARD</div>
          
          <!-- Card Number -->
          <div style="text-align:center;font-size:22px;letter-spacing:6px;margin-top:60px;margin-bottom:40px;">
            ${giftCode || "•••• •••• •••• ••••"}
          </div>
          
          <!-- Card Details -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:15px">
            <div>
              <div style="font-size:10px;opacity:0.7;margin-bottom:4px;">CARDHOLDER NAME</div>
              <div style="font-size:16px;font-weight:600;">${fullName || "JOHN DOE"}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px;opacity:0.7;margin-bottom:4px;">EXPIRES</div>
              <div style="font-size:16px;font-weight:600;">${expirationDate || "--/--"}</div>
            </div>
          </div>
          
          <!-- Amount -->
          <div style="position:absolute;bottom:20px;right:20px;font-size:20px;font-weight:bold;color:#facc15">
            $${amount || "0.00"}
          </div>
        </div>
        
        <!-- Gift Card Info -->
        <div style="padding:24px;">
          <h3 style="text-align:center;font-size:18px;font-weight:600;color:#1e293b;margin-bottom:20px;">GIFT CARD DETAILS</h3>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div style="background:#f9fafb;padding:12px;border-radius:10px;border:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#475569;margin-bottom:6px;">CARD NUMBER</div>
              <div style="font-size:16px;font-weight:bold;color:#1e40af;">${giftCode || "XXXX-XXXX-XXXX"}</div>
            </div>
            <div style="background:#f9fafb;padding:12px;border-radius:10px;border:1px solid #e5e7eb;">
              <div style="font-size:12px;color:#475569;margin-bottom:6px;">EXPIRATION DATE</div>
              <div style="font-size:16px;font-weight:600;">${expirationDate || "--/--"}</div>
            </div>
          </div>

          <div style="background:#eef2ff;border-left:4px solid #3b82f6;padding:12px;border-radius:6px;margin-bottom:20px;">
            <p style="font-size:13px;color:#1e40af;margin:0;">
              <strong>💳 CARD TERMS:</strong> Valid for 24 months from issue date. Redeemable for flights, car rentals, and cruise bookings. 
              Non-refundable. Protect your card number as you would a credit card.
            </p>
          </div>

          <div style="text-align:center;font-size:12px;color:#64748b;">
            <p>24/7 Support: carrentals@bookflydrivestay.com | +1 (855) 613-3131<br/>
            💳 Accepted worldwide for all travel services</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  const subject = `Your Travel Credit for Future Bookings`;

  return { subject, html };
};
