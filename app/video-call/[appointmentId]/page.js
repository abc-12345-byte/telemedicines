// app/video-call/[appointmentId]/page.js

import { use } from "react";
import ClientPage from "./ClientPage";

export default function Page({ params }) {
  const { appointmentId } = use(params);
  return <ClientPage appointmentId={appointmentId} />;
}
