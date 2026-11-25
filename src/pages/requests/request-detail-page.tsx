import { useParams } from "react-router";

import { RequestDetailView } from "@/features/requests";

export default function RequestDetailPage() {
  const { requestId } = useParams();

  return (
    <>
      <title>Request | Rheo</title>
      <RequestDetailView requestId={requestId ?? ""} />
    </>
  );
}
