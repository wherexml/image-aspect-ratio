import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME, REPOSITORY_URL } from "@/lib/seo";
const TITLE = "Contact — " + SITE_NAME;
const DESCRIPTION = "Contact Image Aspect Ratio by email at admin@imageaspectratio.com, or report a calculator problem through GitHub.";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/contact"), links: seoLinks("/contact"), scripts: seoScripts(TITLE, DESCRIPTION, "/contact", false) }),
  component: () => <InfoPage title="Contact"><p>Email <a className="underline" href="mailto:admin@imageaspectratio.com">admin@imageaspectratio.com</a>.</p><p>Report a problem or suggest an improvement in our <a className="underline" href={`${REPOSITORY_URL}/issues`}>GitHub issue tracker</a>.</p><p>For calculation problems, include the page, input dimensions, expected result and actual result. Issues are public; do not include private images or personal information. A GitHub account is required to submit an issue.</p></InfoPage>,
});
