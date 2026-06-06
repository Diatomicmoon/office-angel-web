"use client";

import { useEffect } from "react";

export default function CalendlyEmbed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <div
        className="calendly-inline-widget w-full rounded-2xl overflow-hidden"
        data-url="https://calendly.com/zaki-hardhat-solutions/30min?hide_event_type_details=0&hide_gdpr_banner=1&background_color=111827&text_color=ffffff&primary_color=3b82f6"
        style={{ minWidth: "320px", height: "700px" }}
      />
    </>
  );
}
