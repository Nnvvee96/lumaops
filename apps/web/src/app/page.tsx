import { redirect } from "next/navigation";

// Root redirects to the cockpit entry. The honest "operations cockpit,
// not a marketing splash" stance from CONCEPT §12.2 / [LL §4.1].
export default function HomePage(): never {
  redirect("/overview");
}
