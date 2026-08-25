import Link from "next/link";
import { BASE_PATH } from "@/lib/site";

/** efatoora wordmark — the brand logo image. */
export default function Wordmark({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label="efatoora">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE_PATH}/efatoora-logo.png`}
        alt="efatoora"
        className="h-9 w-auto sm:h-10"
        width={720}
        height={329}
      />
    </Link>
  );
}
