import { jsPDF } from "jspdf";

/**
 * Generates a payment receipt PDF and triggers a browser download.
 * Uses programmatic jsPDF drawing instead of html2canvas to guarantee
 * cross-environment reliability (deployed servers, CDN, etc.)
 */
export function downloadReceiptPdf({
  tenantName,
  unitName,
  propertyName,
  paymentMethod,
  amount,
  datePaid,
  receiptId,
}: {
  tenantName: string;
  unitName?: string;
  propertyName?: string;
  paymentMethod: string;
  amount: number;
  datePaid: string;
  receiptId: string;
}) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const amountFormatted = `RWF ${amount.toLocaleString()}`;

  // Background header band
  pdf.setFillColor(17, 24, 39);
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Header: Property Branding
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18); // Slightly smaller to accommodate longer property names
  pdf.setFont("helvetica", "bold");
  pdf.text((propertyName || "ACRES").toUpperCase(), margin, 25);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Payment Receipt", pageWidth - margin, 25, { align: "right" });

  // Receipt meta row
  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(9);
  pdf.text(`Receipt #: ${receiptId}`, margin, 52);
  pdf.text(`Date: ${datePaid}`, pageWidth - margin, 52, { align: "right" });

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, 57, pageWidth - margin, 57);

  // Section: Received From
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text("RECEIVED FROM", margin, 68);

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(20, 20, 20);
  pdf.text(tenantName, margin, 77);

  if (unitName) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(90, 90, 90);
    pdf.text(unitName, margin, 84);
  }



  // Section: Payment details
  const detailsY = 107;
  pdf.setDrawColor(240, 240, 240);
  pdf.setFillColor(248, 249, 250);
  pdf.roundedRect(margin, detailsY - 6, contentWidth, 38, 3, 3, "FD");

  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text("Payment Method", margin + 8, detailsY + 3);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(20, 20, 20);
  pdf.text(paymentMethod, margin + 8, detailsY + 11);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(120, 120, 120);
  pdf.text("Date Paid", margin + 8, detailsY + 21);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(20, 20, 20);
  pdf.text(datePaid, margin + 8, detailsY + 29);

  // Section: Amount
  const amtY = 158;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, amtY, pageWidth - margin, amtY);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(90, 90, 90);
  pdf.text("Rent Payment", margin, amtY + 10);
  pdf.text(amountFormatted, pageWidth - margin, amtY + 10, { align: "right" });

  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, amtY + 15, pageWidth - margin, amtY + 15);

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(20, 20, 20);
  pdf.text("Total Paid", margin, amtY + 26);
  pdf.text(amountFormatted, pageWidth - margin, amtY + 26, { align: "right" });

  // PAID watermark
  pdf.setTextColor(22, 163, 74);
  pdf.setFontSize(52);
  pdf.setFont("helvetica", "bold");
  pdf.setGState(pdf.GState({ opacity: 0.07 }));
  pdf.text("PAID", pageWidth / 2, 160, { align: "center", angle: 15 });
  pdf.setGState(pdf.GState({ opacity: 1 }));

  // Footer
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(160, 160, 160);
  pdf.text("Powered by Acres — acres.software", pageWidth / 2, 280, { align: "center" });

  const fileName = `receipt_${tenantName.replace(/\s+/g, "_")}_${receiptId}.pdf`;
  pdf.save(fileName);
}
