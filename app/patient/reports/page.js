import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function PatientReportsPage() {
  // Replace with patient ID from auth session later
  const patientId = "replace-with-logged-in-patient-id";

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId },
    include: {
      doctor: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Reports</h1>
      {prescriptions.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Report Link</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((report) => (
              <tr key={report.id}>
                <td>{report.doctor?.user?.email || "N/A"}</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>
                  {report.pdfUrl ? (
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Report
                    </a>
                  ) : (
                    "No file"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
