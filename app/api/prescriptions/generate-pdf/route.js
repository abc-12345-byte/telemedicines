import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      appointmentId,
      patientId,
      diagnosis = '',
      notes = '',
      medications = [],
      createdAt,
    } = body || {};

    // Lazy import pdfkit to keep edge bundles small
    const PDFDocument = (await import('pdfkit')).default;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    const done = new Promise((resolve) => doc.on('end', resolve));

    // Header
    doc.fontSize(18).text('Electronic Prescription', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Appointment: ${appointmentId || 'N/A'}`);
    doc.text(`Patient ID: ${patientId || 'N/A'}`);
    doc.text(`Created: ${createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(12).text('Diagnosis', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(11).text(diagnosis || '—');
    doc.moveDown();

    // Medications
    doc.fontSize(12).text('Medications', { underline: true });
    doc.moveDown(0.25);
    if (Array.isArray(medications) && medications.length > 0) {
      medications.forEach((m, idx) => {
        doc.fontSize(11).text(`${idx + 1}. ${m.name || ''}`);
        if (m.dosage) doc.text(`   Dosage: ${m.dosage}`);
        if (m.frequency) doc.text(`   Frequency: ${m.frequency}`);
        if (m.duration) doc.text(`   Duration: ${m.duration}`);
        if (m.instructions) doc.text(`   Instructions: ${m.instructions}`);
        doc.moveDown(0.25);
      });
    } else {
      doc.fontSize(11).text('—');
    }
    doc.moveDown();

    // Notes
    doc.fontSize(12).text('Notes', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(11).text(notes || '—');

    doc.end();
    await done;

    const pdfBuffer = Buffer.concat(chunks);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescription-${appointmentId || 'document'}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}







