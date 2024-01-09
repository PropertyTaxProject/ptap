import React from "react"
import { Helmet } from "react-helmet"

// TODO: Move to env var
const PIXEL_ID = "2707520652798075"

const Pixel = () => (
  <Helmet>
    <script>
      {`!function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${PIXEL_ID}'); 
  fbq('track', 'PageView');`}
    </script>
    <noscript>
      {`<img height="1" width="1" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`}
    </noscript>
  </Helmet>
)

export default Pixel
