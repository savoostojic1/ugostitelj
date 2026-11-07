import Script from "next/script";

const TAWK_EMBED_SRC =
  "https://embed.tawk.to/6aef4076387e843c391f3eb5/1k6r97jti";

/** Tawk.to live chat. Mounted from the root layout so it loads on every page. */
export function TawkChat() {
  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='${TAWK_EMBED_SRC}';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
