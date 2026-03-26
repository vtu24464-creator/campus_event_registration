package com.campusx.controller;

import com.campusx.config.SecurityUtils;
import com.campusx.entity.Certificate;
import com.campusx.entity.Event;
import com.campusx.entity.User;
import com.campusx.repository.CertificateRepository;
import com.campusx.repository.EventRepository;
import com.campusx.repository.UserRepository;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * CertificatePdfController — generates a branded PDF certificate on-the-fly.
 * GET /api/certificates/{id}/download
 */
@RestController
@RequestMapping("/api/certificates")
public class CertificatePdfController {

    @Autowired
    private CertificateRepository certRepo;

    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadCertificate(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Optional<Certificate> certOpt = certRepo.findById(id);
        if (certOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Certificate cert = certOpt.get();
        // Security: only the owner can download
        if (!cert.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(403).body("Access denied");
        }

        Optional<Event> eventOpt = eventRepo.findById(cert.getEventId());
        Optional<User> userOpt = userRepo.findById(cert.getUserId());

        if (eventOpt.isEmpty() || userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Event event = eventOpt.get();
        User user = userOpt.get();

        try {
            byte[] pdfBytes = generateCertificatePdf(cert, event, user);

            String filename = "certificate_" + event.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Certificate generation failed: " + e.getMessage());
        }
    }

    private byte[] generateCertificatePdf(Certificate cert, Event event, User user) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate()); // Landscape for certificate

        Document doc = new Document(pdf);
        doc.setMargins(40, 60, 40, 60);

        PdfFont headingFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont bodyFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont italicFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

        // ── Decorative Border ──────────────────────────────────
        PdfCanvas canvas = new PdfCanvas(pdf.getFirstPage());
        DeviceRgb primaryColor = new DeviceRgb(108, 99, 255);
        DeviceRgb accentColor = new DeviceRgb(253, 121, 168);

        float pageWidth = PageSize.A4.rotate().getWidth();
        float pageHeight = PageSize.A4.rotate().getHeight();

        // Outer border
        canvas.setStrokeColor(primaryColor).setLineWidth(3)
                .rectangle(20, 20, pageWidth - 40, pageHeight - 40).stroke();
        // Inner border
        canvas.setStrokeColor(accentColor).setLineWidth(1)
                .rectangle(26, 26, pageWidth - 52, pageHeight - 52).stroke();

        // Corner accents
        float cs = 18;
        canvas.setStrokeColor(primaryColor).setLineWidth(4);
        // Top-left
        canvas.moveTo(20, 20 + cs).lineTo(20, 20).lineTo(20 + cs, 20).stroke();
        // Top-right
        canvas.moveTo(pageWidth - 20 - cs, 20).lineTo(pageWidth - 20, 20).lineTo(pageWidth - 20, 20 + cs).stroke();
        // Bottom-left
        canvas.moveTo(20, pageHeight - 20 - cs).lineTo(20, pageHeight - 20).lineTo(20 + cs, pageHeight - 20).stroke();
        // Bottom-right
        canvas.moveTo(pageWidth - 20 - cs, pageHeight - 20).lineTo(pageWidth - 20, pageHeight - 20)
                .lineTo(pageWidth - 20, pageHeight - 20 - cs).stroke();

        // ── Header ────────────────────────────────────────────
        doc.add(new Paragraph()
                .add(new Text("🎓 CampusX").setFont(headingFont).setFontSize(13).setFontColor(primaryColor)));

        doc.add(new Paragraph()
                .add(new Text("CERTIFICATE OF PARTICIPATION")
                        .setFont(headingFont)
                        .setFontSize(26)
                        .setFontColor(new DeviceRgb(230, 237, 243)))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10));

        // Divider line
        SolidLine line = new SolidLine(1.5f);
        line.setColor(primaryColor);
        doc.add(new LineSeparator(line).setMarginTop(6).setMarginBottom(6));

        // ── Body ──────────────────────────────────────────────
        doc.add(new Paragraph("This is to certify that")
                .setFont(italicFont).setFontSize(13)
                .setFontColor(new DeviceRgb(139, 148, 158))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(16));

        String fullName = user.getFirstName() + " " + user.getLastName();
        doc.add(new Paragraph(fullName)
                .setFont(headingFont).setFontSize(30)
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(4).setMarginBottom(4));

        if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
            doc.add(new Paragraph("Roll No: " + user.getRollNumber() + "  |  "
                    + (user.getDepartment() != null ? user.getDepartment() : ""))
                    .setFont(bodyFont).setFontSize(11)
                    .setFontColor(new DeviceRgb(139, 148, 158))
                    .setTextAlignment(TextAlignment.CENTER));
        }

        doc.add(new Paragraph("has successfully participated in")
                .setFont(italicFont).setFontSize(13)
                .setFontColor(new DeviceRgb(139, 148, 158))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(16));

        doc.add(new Paragraph(event.getTitle())
                .setFont(headingFont).setFontSize(22)
                .setFontColor(new DeviceRgb(162, 155, 254))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(4).setMarginBottom(4));

        String cat = event.getCategory() != null
                ? event.getCategory().substring(0, 1).toUpperCase() + event.getCategory().substring(1)
                : "";
        String venue = event.getVenue() != null ? event.getVenue() : "";
        String dateStr = event.getEventDate() != null
                ? event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
                : "";

        doc.add(new Paragraph(cat + " Event  ·  " + venue + "  ·  " + dateStr)
                .setFont(bodyFont).setFontSize(11)
                .setFontColor(new DeviceRgb(139, 148, 158))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(8));

        // Divider
        SolidLine line2 = new SolidLine(0.8f);
        line2.setColor(accentColor);
        doc.add(new LineSeparator(line2).setMarginBottom(16));

        // ── Footer ────────────────────────────────────────────
        String issuedDate = cert.getIssuedAt() != null
                ? cert.getIssuedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                : "";

        doc.add(new Paragraph("Issued on: " + issuedDate + "        Certificate ID: CXCERT-" + cert.getId())
                .setFont(bodyFont).setFontSize(10)
                .setFontColor(new DeviceRgb(110, 118, 129))
                .setTextAlignment(TextAlignment.CENTER));

        doc.add(new Paragraph("CampusX Campus Event Portal  ·  campus-event-portal.edu")
                .setFont(italicFont).setFontSize(9)
                .setFontColor(new DeviceRgb(110, 118, 129))
                .setTextAlignment(TextAlignment.CENTER));

        doc.close();
        return baos.toByteArray();
    }
}
