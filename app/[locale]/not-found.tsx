import { C, FONTS } from "@/lib/theme";
import { BrandButtonLink, Inner, NAV_HEIGHT, RuleText, SectionCover } from "@/components/brand/ui";

// Branded 404 inside the root layout (fonts, nav, footer). not-found can't
// read route params, so it is bilingual by design.
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body, paddingTop: NAV_HEIGHT }}>
      <SectionCover as="h1" title="Page not found." sub="ページが見つかりません" no="404" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 96, paddingBottom: 120 }}>
        <RuleText style={{ maxWidth: 640 }}>
          お探しのページは見つかりませんでした。URL が変わったか、削除された可能性があります。
          <br />
          The page you are looking for doesn&apos;t exist or has moved.
        </RuleText>
        <div style={{ marginTop: 48, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <BrandButtonLink href="/" arrow={false}>
            ← Home
          </BrandButtonLink>
          <BrandButtonLink href="/research" variant="outline" arrow={false}>
            Research
          </BrandButtonLink>
        </div>
      </Inner>
    </main>
  );
}
