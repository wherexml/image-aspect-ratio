import { site } from "./site";

// Public measurement ID. Only the official HTTPS origin may send events.
const measurementId = import.meta.env["VITE_GA4_MEASUREMENT_ID"]?.trim();
export const analyticsScript =
  measurementId && /^G-[A-Z0-9]+$/.test(measurementId) && site.indexable && site.origin
    ? `(function(){if(location.origin!==${JSON.stringify(site.origin)}||document.querySelector('script[data-ratio-analytics]'))return;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());var flag=new URLSearchParams(location.search).get('analytics_test');var qa=flag==='1';try{if(flag==='1'||flag==='0')sessionStorage.setItem('arc-analytics-test',flag);qa=sessionStorage.getItem('arc-analytics-test')==='1';}catch(e){}gtag('config',${JSON.stringify(measurementId)},{send_page_view:!qa,debug_mode:qa,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:2592000});if(qa)gtag('event','qa_page_view',{debug_mode:true,test_traffic:'internal'});var s=document.createElement('script');s.async=true;s.dataset.ratioAnalytics='true';s.src='https://www.googletagmanager.com/gtag/js?id='+${JSON.stringify(measurementId)};document.head.appendChild(s);})();`
    : null;

// The production tracker uses the site's own collection endpoints.
export const geoAnalyticsScript = site.indexable && site.origin === "https://imageaspectratio.com"
  ? `(function(){if(location.origin!=="https://imageaspectratio.com"||navigator.doNotTrack==="1"||document.querySelector('script[data-ratio-geo]'))return;var flag=new URLSearchParams(location.search).get('analytics_test');var qa=flag==='1';try{if(flag==='1'||flag==='0')sessionStorage.setItem('arc-analytics-test',flag);qa=sessionStorage.getItem('arc-analytics-test')==='1';}catch(e){}if(qa)return;var s=document.createElement('script');s.async=true;s.dataset.ratioGeo='true';s.dataset.websiteId='0e360655-0b8c-4334-98dd-99634b96d0c0';s.dataset.domains='imageaspectratio.com';s.dataset.doNotTrack='true';s.dataset.excludeSearch='true';s.dataset.excludeHash='true';s.dataset.hostUrl='https://imageaspectratio.com/_geo';s.src='/_geo/script.js';document.head.appendChild(s);})();`
  : null;
