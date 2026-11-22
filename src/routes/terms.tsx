import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { previewSeoMeta, seoLinks, seoScripts, SITE_NAME } from "@/lib/seo";
const TITLE = "Terms — " + SITE_NAME;
const DESCRIPTION = "Read the usage terms for Aspect Ratio Calculator, including rounded dimensions, preview limitations, and checking results before use.";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/terms"), links: seoLinks("/terms"), scripts: seoScripts(TITLE, DESCRIPTION, "/terms", false) }),
  component: () => <InfoPage title="Terms"><section><h2 className="text-lg font-semibold text-foreground">Using the tools</h2><p>Use the calculator to explore dimensions and frame proportions. Select only files you are entitled to use. No account or payment is required by this version of the calculator.</p></section>
<section><h2 className="text-lg font-semibold text-foreground">Checking results</h2><p>Check the dimensions and requirements of your destination before using a result. Rounded pixel sizes can differ slightly from an exact ratio. Video previews assume square pixels and do not inspect video metadata.</p><p>Fit and Fill are visual previews. Make image square, Change image aspect ratio and Screenshot Studio create a new PNG or JPEG in your browser and leave your original file unchanged. The other tools do not modify, export or transcode files. No result guarantees acceptance by another platform.</p></section></InfoPage>,
});
