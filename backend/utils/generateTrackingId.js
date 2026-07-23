// SRS 3.3.5 Place Order -> Postcondition: "Order confirmation and tracking ID are generated."
const generateTrackingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TRK-${timestamp}-${random}`;
};

module.exports = generateTrackingId;
