const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Billing = require("../models/Billing");
const { verifyRole } = require("../middlewares/authMiddleware");

router.post("/add", verifyRole(["doctor"]), async (req, res) => {
  try {
    const { patientId, services } = req.body;
    const totalAmount = services.reduce(
      (sum, service) => sum + service.cost,
      0
    );
    const bill = new Billing({
      patient: patientId,
      doctor: req.user._id,
      services,
      totalAmount,
    });
    await bill.save();
    res.json({ message: "Billing record added successfully", bill });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.get(
  "/:patientId",
  verifyRole(["doctor", "patient"]),
  async (req, res) => {
    try {
      const query =
        req.user.role === "doctor"
          ? { patient: req.params.patientId }
          : { patient: req.user._id };
      const bills = await Billing.find(query).populate("doctor", "name email");
      res.json(bills);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
);

router.patch("/pay/:billingId", verifyRole(["doctor"]), async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.billingId);
    if (!bill)
      return res.status(404).json({ error: "Billing record not found" });
    bill.status = "paid";
    await bill.save();
    res.json({ message: "Payment marked as paid", bill });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.get(
  "/invoice/:billingId",
  verifyRole(["doctor", "patient"]),
  async (req, res) => {
    try {
      const bill = await Billing.findById(req.params.billingId)
        .populate("doctor", "name email")
        .populate("patient", "name");

      if (!bill)
        return res.status(404).json({ error: "Billing record not found" });

      if (
        (req.user.role === "doctor" &&
          bill.doctor._id.toString() !== req.user._id.toString()) ||
        (req.user.role === "patient" &&
          bill.patient._id.toString() !== req.user._id.toString())
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized to view this bill" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=bill_${bill._id}.pdf`
      );

      const doc = new PDFDocument({ margin: 50, size: "A4" });
      doc.pipe(res);

      doc.rect(0, 0, doc.page.width, 100).fill("#f6f6f6");
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text(`BILLING STATEMENT`, { align: "center", y: 40 });

      doc.moveDown(2);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text(`Dr. ${bill.doctor.name}`, { align: "left" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Email: ${bill.doctor.email}`, { align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Date: ${new Date(bill.issuedAt).toLocaleDateString()}`, {
          align: "right",
        });
      doc.text(`Invoice #: ${bill._id.toString().slice(-6).toUpperCase()}`, {
        align: "right",
      });

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .lineWidth(1)
        .strokeColor("#cccccc")
        .stroke();

      doc.moveDown(1);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text(`PATIENT: ${bill.patient.name}`);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text(`STATUS: ${bill.status.toUpperCase()}`, { align: "right" });

      doc.moveDown(1.5);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text("SERVICES");
      doc.rect(50, doc.y, doc.page.width - 100, 0.5).fill("#0066cc");
      doc.moveDown(0.5);

      if (bill.services && bill.services.length > 0) {
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [350, 130];

        doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333");
        doc.text("Service Description", tableLeft, tableTop);
        doc.text("Cost (Rs)", tableLeft + colWidths[0], tableTop);

        doc
          .moveTo(50, doc.y + 15)
          .lineTo(doc.page.width - 50, doc.y + 15)
          .stroke();
        doc.moveDown(1);

        bill.services.forEach((service, index) => {
          const rowY = doc.y + 10;

          doc.fontSize(10).font("Helvetica").fillColor("#333333");

          doc.text(service.description, tableLeft, rowY, {
            width: colWidths[0] - 10,
          });
          doc.text(
            `Rs. ${service.cost.toFixed(2)}`,
            tableLeft + colWidths[0],
            rowY,
            { align: "left" }
          );

          doc.moveDown(0.8);
          if (index < bill.services.length - 1) {
            doc
              .moveTo(50, doc.y - 5)
              .lineTo(doc.page.width - 50, doc.y - 5)
              .lineWidth(0.5)
              .dash(3, { space: 2 })
              .stroke();
            doc.undash();
          }
        });

        doc.moveDown(1);
        doc
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .lineWidth(1)
          .strokeColor("#cccccc")
          .stroke();
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#333333")
          .text(`TOTAL: Rs. ${bill.totalAmount.toFixed(2)}`, {
            align: "right",
          });
      } else {
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#666666")
          .text("No services billed.");
      }

      doc.moveDown(1.5);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text("PAYMENT INFORMATION");
      doc.rect(50, doc.y, doc.page.width - 100, 0.5).fill("#0066cc");
      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#333333")
        .text("Please make payment within 30 days of receipt.");
      doc.moveDown(0.5);
      doc.text("Payment Methods: Bank Transfer, Credit Card, Cash");

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#999999")
        .text(
          "This bill was generated electronically and is valid without a signature.",
          50,
          doc.page.height - 50,
          {
            width: doc.page.width - 100,
            align: "center",
          }
        );

      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    }
  }
);

module.exports = router;
