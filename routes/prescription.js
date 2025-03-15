const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Prescription = require("../models/Prescription");
const { verifyRole } = require("../middlewares/authMiddleware");

router.post("/add", verifyRole(["doctor"]), async (req, res) => {
  try {
    const { patientId, diagnosis, medicines, additionalNotes } = req.body;

    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      medicines,
      additionalNotes,
    });

    await prescription.save();
    res.json({ message: "Prescription added successfully", prescription });
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
          ? { patient: req.params.patientId, doctor: req.user._id }
          : { patient: req.user._id };

      const prescriptions = await Prescription.find(query).populate(
        "doctor",
        "name email"
      );

      res.json(prescriptions);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
);

router.get(
  "/pdf/:prescriptionId",
  verifyRole(["doctor", "patient"]),
  async (req, res) => {
    try {
      const prescription = await Prescription.findById(
        req.params.prescriptionId
      )
        .populate("doctor", "name email")
        .populate("patient", "name");

      if (!prescription)
        return res.status(404).json({ error: "Prescription not found" });
      if (
        (req.user.role === "doctor" &&
          prescription.doctor._id.toString() !== req.user._id.toString()) ||
        (req.user.role === "patient" &&
          prescription.patient._id.toString() !== req.user._id.toString())
      ) {
        return res
          .status(403)
          .json({ error: "Unauthorized to view this prescription" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=prescription_${prescription._id}.pdf`
      );

      const doc = new PDFDocument({ margin: 50, size: "A4" });
      doc.pipe(res);

      doc.rect(0, 0, doc.page.width, 100).fill("#f6f6f6");
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text(`MEDICAL PRESCRIPTION`, { align: "center", y: 40 });

      doc.moveDown(2);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text(`Dr. ${prescription.doctor.name}`, { align: "left" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(`Email: ${prescription.doctor.email}`, { align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#666666")
        .text(
          `Date: ${new Date(prescription.createdAt).toLocaleDateString()}`,
          { align: "right" }
        );
      doc.text(
        `Ref #: ${prescription._id.toString().slice(-6).toUpperCase()}`,
        {
          align: "right",
        }
      );

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
        .text(`PATIENT: ${prescription.patient.name}`);

      doc.moveDown(1.5);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text("DIAGNOSIS");
      doc.rect(50, doc.y, doc.page.width - 100, 0.5).fill("#0066cc");
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#333333")
        .text(prescription.diagnosis || "No diagnosis provided.");

      doc.moveDown(1.5);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#0066cc")
        .text("PRESCRIBED MEDICINES");
      doc.rect(50, doc.y, doc.page.width - 100, 0.5).fill("#0066cc");
      doc.moveDown(0.5);

      if (prescription.medicines && prescription.medicines.length > 0) {
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [180, 100, 100, 100];

        doc.fontSize(10).font("Helvetica-Bold").fillColor("#333333");
        doc.text("Medicine", tableLeft, tableTop);
        doc.text("Dosage", tableLeft + colWidths[0], tableTop);
        doc.text(
          "Frequency",
          tableLeft + colWidths[0] + colWidths[1],
          tableTop
        );
        doc.text(
          "Duration",
          tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
          tableTop
        );

        doc
          .moveTo(50, doc.y + 15)
          .lineTo(doc.page.width - 50, doc.y + 15)
          .stroke();
        doc.moveDown(1);

        prescription.medicines.forEach((med, index) => {
          const rowY = doc.y + 10;

          doc.fontSize(10).font("Helvetica").fillColor("#333333");
          doc.text(med.medicineName, tableLeft, rowY, {
            width: colWidths[0] - 10,
          });
          doc.text(med.dosage, tableLeft + colWidths[0], rowY, {
            width: colWidths[1] - 10,
          });
          doc.text(
            med.frequency,
            tableLeft + colWidths[0] + colWidths[1],
            rowY,
            { width: colWidths[2] - 10 }
          );
          doc.text(
            med.duration,
            tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
            rowY,
            { width: colWidths[3] - 10 }
          );

          if (med.instructions) {
            doc.moveDown(1);
            doc.fontSize(9).font("Helvetica").fillColor("#666666");
            doc.text(`Instructions: ${med.instructions}`, { indent: 20 });
          }

          doc.moveDown(0.8);
          if (index < prescription.medicines.length - 1) {
            doc
              .moveTo(50, doc.y - 5)
              .lineTo(doc.page.width - 50, doc.y - 5)
              .lineWidth(0.5)
              .dash(3, { space: 2 })
              .stroke();
            doc.undash();
          }
        });

        doc.moveDown(0.5);
        doc
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .lineWidth(1)
          .strokeColor("#cccccc")
          .stroke();
      } else {
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#666666")
          .text("No medicines prescribed.");
      }

      if (prescription.additionalNotes) {
        doc.moveDown(1.5);
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#0066cc")
          .text("ADDITIONAL NOTES");
        doc.rect(50, doc.y, doc.page.width - 100, 0.5).fill("#0066cc");
        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#333333")
          .text(prescription.additionalNotes);
      }

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#999999")
        .text(
          "This prescription was issued electronically and is valid without a signature.",
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
