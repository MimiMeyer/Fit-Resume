import React from "react";
import { Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { TailorResumePdfRequest } from "./types";

const pxToPt = (px: number) => px * 0.75;
const ptForPdfBorderValue = (pt: number) => (pt === 0 ? "0" : pt);

export function ResumePdfDocument(props: TailorResumePdfRequest) {
  const { header, layoutMode, palette: rawPalette, fontSizes, spacing, borders, paginatedSections } = props;

  const contactItems = buildContactItems(header);

  const headerNameSize = pxToPt(fontSizes.headingPx);
  const headerTitleSize = pxToPt(fontSizes.subtitlePx);

  const palette = normalizePaletteForPdf(rawPalette);
  const resolvedOpacity = Number.isFinite(props.accentOpacity) ? props.accentOpacity : 1;
  const sidebarBg =
    props.accentIsNone || resolvedOpacity <= 0 ? "#f8fafc" : palette.accentFill;
  const sidebarText =
    props.accentIsNone || resolvedOpacity < 0.6 ? "#0b1b2b" : palette.accentText;
  const sidebarTitle =
    !props.accentIsNone && resolvedOpacity < 0.3 ? palette.accent : sidebarText;

  const borderStyle = borders?.style ?? "solid";
  const borderWidthPxRaw = typeof borders?.widthPx === "number" && Number.isFinite(borders.widthPx) ? borders.widthPx : 1;
  const borderWidthPx = Math.max(0, borderWidthPxRaw);
  const targets = borders?.targets ?? { page: false, summary: true, section: true, content: true };
  const pageBorderWidthPx = targets.page ? borderWidthPx : 0;
  const summaryBorderWidthPx = targets.summary ? borderWidthPx : 0;
  const sectionBorderWidthPx = targets.section ? borderWidthPx : 0;
  const cardBorderWidthPx = targets.content ? borderWidthPx : 0;

  const radiusMode = borders?.radius === "sharp" ? "sharp" : "rounded";
  const radiusPagePx = radiusMode === "sharp" ? 0 : 8;
  const radiusBoxPx = radiusMode === "sharp" ? 0 : 6;
  const radiusSidePx = radiusMode === "sharp" ? 0 : 10;

  const sectionBorderColor = palette.accentBorder || "#d1d5db";
  const sectionTitleColor = palette.accent || "#0b1b2b";
  const bodyTextColor = "#0b1b2b";
  const mutedTextColor = "#475569";

  const pdfFonts = resolvePdfFonts(props);

  const styles = StyleSheet.create({
    page: {
      paddingTop: pxToPt(12),
      paddingBottom: pxToPt(12),
      paddingHorizontal: pxToPt(spacing.pagePaddingPx),
      fontSize: pxToPt(fontSizes.bodyPx),
      fontFamily: pdfFonts.body,
      color: bodyTextColor,
      lineHeight: 1.25,
      justifyContent: "flex-start",
      borderWidth: ptForPdfBorderValue(pxToPt(pageBorderWidthPx)),
      borderStyle,
      borderColor: sectionBorderColor,
      borderRadius: ptForPdfBorderValue(pxToPt(radiusPagePx)),
    },
    headerName: {
      fontSize: headerNameSize,
      textAlign: "center",
      fontWeight: 700,
      color: sectionTitleColor,
      fontFamily: pdfFonts.title,
      paddingBottom: pxToPt(12),
    },
    summaryBox: {
      marginTop: pxToPt(8),
      width: "92%",
      alignSelf: "center",
      padding: pxToPt(10),
      borderWidth: ptForPdfBorderValue(pxToPt(summaryBorderWidthPx)),
      borderStyle,
      borderColor: sectionBorderColor,
      borderRadius: ptForPdfBorderValue(pxToPt(radiusBoxPx)),
      backgroundColor: "#f8fafc",
    },
    summaryTitle: {
      fontSize: headerTitleSize,
      textAlign: "center",
      fontWeight: 700,
      fontFamily: pdfFonts.title,
      color: bodyTextColor,
      paddingBottom: pxToPt(6), 

    },
    summaryText: {
      fontSize: pxToPt(fontSizes.bodyPx),
      lineHeight: 1.3,
    },
    inlineContact: {
      marginTop: pxToPt(10),
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      fontSize: pxToPt(fontSizes.bodyPx),
      lineHeight: 1.3,
    },
    columns: {
      marginTop: pxToPt(12),
      flexDirection: "row",
      width: "100%",
    },
    colSide: {
      width: "36%",
      padding: pxToPt(12),
      borderRadius: ptForPdfBorderValue(pxToPt(radiusSidePx)),
      backgroundColor: sidebarBg,
    },
    colMain: {
      width: "64%",
      paddingLeft: pxToPt(12),
    },
    section: {
      borderWidth: ptForPdfBorderValue(pxToPt(sectionBorderWidthPx)),
      borderStyle,
      borderColor: sectionBorderColor,
      borderRadius: ptForPdfBorderValue(pxToPt(radiusBoxPx)),
      padding: pxToPt(10),
      marginBottom: pxToPt(spacing.sectionGapPx),
      backgroundColor: "#ffffff",
    },
    card: {
      borderWidth: ptForPdfBorderValue(pxToPt(cardBorderWidthPx)),
      borderStyle,
      borderColor: sectionBorderColor,
      borderRadius: ptForPdfBorderValue(pxToPt(radiusBoxPx)),
      paddingVertical: pxToPt(8),
      paddingHorizontal: pxToPt(10),
      backgroundColor: "#f8fafc",
    },
    sectionTitle: {
      fontSize: pxToPt(fontSizes.subtitlePx),
      letterSpacing: 0.6,
      textTransform: "uppercase",
      fontWeight: 700,
      color: sectionTitleColor,
      marginBottom: pxToPt(6),
      fontFamily: pdfFonts.heading,
    },
    sideSectionTitle: {
      fontSize: pxToPt(fontSizes.subtitlePx),
      letterSpacing: 0.6,
      textTransform: "uppercase",
      fontWeight: 700,
      color: sidebarTitle,
      marginBottom: pxToPt(6),
      fontFamily: pdfFonts.heading,
    },
    rowTitle: { fontWeight: 700, fontSize: pxToPt(fontSizes.bodyPx), fontFamily: pdfFonts.body },
    rowMeta: {
      color: mutedTextColor,
      marginTop: pxToPt(1),
      fontSize: pxToPt(fontSizes.bodyPx),
      fontFamily: pdfFonts.body,
    },
    bullet: { flexDirection: "row", marginBottom: pxToPt(spacing.bulletGapPx) },
    bulletDot: { width: pxToPt(10), marginRight: pxToPt(6) },
    bulletText: { flex: 1 },
    link: { textDecoration: "underline", color: bodyTextColor },
    sideText: { color: sidebarText },
    sideLink: { textDecoration: "underline", color: sidebarText },
  });

  const pages = paginatedSections?.length ? paginatedSections : [[
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
  ]];

  return (
    <>
      {pages.map((sectionIds, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 ? (
            <>
              <Text style={styles.headerName}>{header.fullName || "Resume"}</Text>

              {header.summary || header.title ? (
                <View style={styles.summaryBox}>
                  {header.title ? <Text style={styles.summaryTitle}>{header.title}</Text> : null}
                  {header.summary ? <Text style={styles.summaryText}>{header.summary}</Text> : null}
                </View>
              ) : null}

              {layoutMode === "single" ? (
                <View style={styles.inlineContact}>
                  <InlineContact contactItems={contactItems} linkStyle={styles.link} />
                </View>
              ) : null}
            </>
          ) : null}

          {layoutMode === "two" ? (
            <View style={styles.columns}>
              <View style={styles.colSide}>
                {pageIndex === 0 ? (
                  <SideContactSection
                    titleStyle={styles.sideSectionTitle}
                    itemStyle={styles.sideText}
                    linkStyle={styles.sideLink}
                    contactItems={contactItems}
                  />
                ) : null}
                {sectionIds.includes("skills") ? (
                  <SideSkillsSection
                    titleStyle={styles.sideSectionTitle}
                    itemStyle={styles.sideText}
                    groups={props.skillGroups}
                  />
                ) : null}
                {sectionIds.includes("certifications") ? (
                  <SideCertificationsSection
                    titleStyle={styles.sideSectionTitle}
                    itemStyle={styles.sideText}
                    linkStyle={styles.sideLink}
                    certs={props.certifications}
                  />
                ) : null}
              </View>
              <View style={styles.colMain}>
                {sectionIds.includes("experience") ? (
                  <ExperienceSection
                    titleStyle={styles.sectionTitle}
                    boxStyle={styles.section}
                    cardStyle={styles.card}
                    metaStyle={styles.rowMeta}
                    bulletDotStyle={styles.bulletDot}
                    bulletRowStyle={styles.bullet}
                    bulletTextStyle={styles.bulletText}
                    rowTitleStyle={styles.rowTitle}
                    experiences={props.experiences}
                  />
                ) : null}
                {sectionIds.includes("education") ? (
                  <EducationSection
                    titleStyle={styles.sectionTitle}
                    boxStyle={styles.section}
                    cardStyle={styles.card}
                    metaStyle={styles.rowMeta}
                    rowTitleStyle={styles.rowTitle}
                    education={props.education}
                  />
                ) : null}
                {sectionIds.includes("projects") ? (
                  <ProjectsSection
                    titleStyle={styles.sectionTitle}
                    boxStyle={styles.section}
                    cardStyle={styles.card}
                    metaStyle={styles.rowMeta}
                    linkStyle={styles.link}
                    rowTitleStyle={styles.rowTitle}
                    projects={props.projects}
                  />
                ) : null}
              </View>
            </View>
          ) : (
            <View style={{ marginTop: pxToPt(12) }}>
              {sectionIds.includes("experience") ? (
                <ExperienceSection
                  titleStyle={styles.sectionTitle}
                  boxStyle={styles.section}
                  cardStyle={styles.card}
                  metaStyle={styles.rowMeta}
                  bulletDotStyle={styles.bulletDot}
                  bulletRowStyle={styles.bullet}
                  bulletTextStyle={styles.bulletText}
                  rowTitleStyle={styles.rowTitle}
                  experiences={props.experiences}
                />
              ) : null}
              {sectionIds.includes("skills") ? (
                <SkillsSection
                  titleStyle={styles.sectionTitle}
                  boxStyle={styles.section}
                  cardStyle={styles.card}
                  groups={props.skillGroups}
                />
              ) : null}
              {sectionIds.includes("education") ? (
                <EducationSection
                  titleStyle={styles.sectionTitle}
                  boxStyle={styles.section}
                  cardStyle={styles.card}
                  metaStyle={styles.rowMeta}
                  rowTitleStyle={styles.rowTitle}
                  education={props.education}
                />
              ) : null}
              {sectionIds.includes("projects") ? (
                <ProjectsSection
                  titleStyle={styles.sectionTitle}
                  boxStyle={styles.section}
                  cardStyle={styles.card}
                  metaStyle={styles.rowMeta}
                  linkStyle={styles.link}
                  rowTitleStyle={styles.rowTitle}
                  projects={props.projects}
                />
              ) : null}
              {sectionIds.includes("certifications") ? (
                <CertificationsSection
                  titleStyle={styles.sectionTitle}
                  boxStyle={styles.section}
                  cardStyle={styles.card}
                  linkStyle={styles.link}
                  certs={props.certifications}
                />
              ) : null}
            </View>
          )}
        </Page>
      ))}
    </>
  );
}

type ContactItem =
  | { kind: "text"; value: string }
  | { kind: "email"; value: string }
  | { kind: "phone"; value: string }
  | { kind: "url"; value: string };

function buildContactItems(header: TailorResumePdfRequest["header"]): ContactItem[] {
  const items: ContactItem[] = [];
  if (header.location) items.push({ kind: "text", value: header.location });
  if (header.phone) items.push({ kind: "phone", value: header.phone });
  if (header.email) items.push({ kind: "email", value: header.email });
  if (header.websiteUrl) items.push({ kind: "url", value: header.websiteUrl });
  if (header.githubUrl) items.push({ kind: "url", value: header.githubUrl });
  if (header.linkedinUrl) items.push({ kind: "url", value: header.linkedinUrl });
  return items;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function resolvePdfFonts(props: TailorResumePdfRequest) {
  // React-PDF can't use system fonts like Calibri/Segoe UI on Vercel unless we embed font files.
  // Map the selected CSS families to the closest built-in PDF fonts.
  const resolveOne = (cssFamily: string | null | undefined) => {
    const value = (cssFamily || "").toLowerCase();
    if (value.includes("courier") || value.includes("mono")) {
      return "Courier";
    }
    if (value.includes("times") || value.includes("georgia") || value.includes("serif")) {
      return "Times-Roman";
    }
    return "Helvetica";
  };

  return {
    title: resolveOne(props.fontFamilies?.title),
    heading: resolveOne(props.fontFamilies?.heading),
    body: resolveOne(props.fontFamilies?.body),
  };
}

function normalizePaletteForPdf(palette: TailorResumePdfRequest["palette"]) {
  // React-PDF color parsing is stricter than CSS; convert rgba(...) values into solid hex.
  return {
    accent: normalizePdfColor(palette.accent),
    accentFill: normalizePdfColor(palette.accentFill),
    accentLight: normalizePdfColor(palette.accentLight),
    accentSoft: normalizePdfColor(palette.accentSoft),
    accentBorder: normalizePdfColor(palette.accentBorder),
    accentText: normalizePdfColor(palette.accentText),
  };
}

function normalizePdfColor(input: string) {
  const v = input.trim();
  if (!v) return "#000000";
  if (v.startsWith("#")) return normalizeHex(v);
  const rgba = tryParseRgba(v);
  if (!rgba) return "#000000";
  // Blend against white to avoid transparency differences in PDF renderers.
  const r = Math.round(rgba.r * rgba.a + 255 * (1 - rgba.a));
  const g = Math.round(rgba.g * rgba.a + 255 * (1 - rgba.a));
  const b = Math.round(rgba.b * rgba.a + 255 * (1 - rgba.a));
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

function normalizeHex(hex: string) {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (h.length === 6) return `#${h}`.toLowerCase();
  return "#000000";
}

function toHex2(n: number) {
  const clamped = Math.max(0, Math.min(255, n));
  return clamped.toString(16).padStart(2, "0");
}

function tryParseRgba(value: string): { r: number; g: number; b: number; a: number } | null {
  const m = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?)\s*)?\)$/i,
  );
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = m[4] == null ? 1 : Number(m[4]);
  if (![r, g, b, a].every(Number.isFinite)) return null;
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  if (a < 0 || a > 1) return null;
  return { r, g, b, a };
}

const marginBottomStyle: Style = { marginBottom: 5 };

function ContactInlineItem({ item, linkStyle }: { item: ContactItem; linkStyle: Style }) {
  if (item.kind === "email") return <Text>{item.value}</Text>;
  if (item.kind === "phone") return <Text>{item.value}</Text>;
  if (item.kind === "url") {
    const href = normalizeUrl(item.value);
    if (!href) return <Text>{item.value}</Text>;
    return (
      <Link src={href} style={linkStyle}>
        {item.value}
      </Link>
    );
  }
  return <Text>{item.value}</Text>;
}

function InlineContact({ contactItems, linkStyle }: { contactItems: ContactItem[]; linkStyle: Style }) {
  if (!contactItems.length) return null;
  return (
    <>
      {contactItems.map((item, idx) => (
        <React.Fragment key={`${item.kind}:${item.value}`}>
          {idx ? <Text> • </Text> : null}
          <ContactInlineItem item={item} linkStyle={linkStyle} />
        </React.Fragment>
      ))}
    </>
  );
}

function SideContactSection({
  titleStyle,
  itemStyle,
  linkStyle,
  contactItems,
}: {
  titleStyle: Style;
  itemStyle: Style;
  linkStyle: Style;
  contactItems: ContactItem[];
}) {
  if (!contactItems.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={titleStyle}>Contact</Text>
      <View style={{ marginTop: 6 }}>
        {contactItems.map((item) => {
          if (item.kind === "url") {
            const href = normalizeUrl(item.value);
            if (href) {
              return (
                <Link key={`${item.kind}:${item.value}`} src={href} style={linkStyle}>
                  {item.value}
                </Link>
              );
            }
          }
          return (
            <Text key={`${item.kind}:${item.value}`} style={[itemStyle, marginBottomStyle]}>
              {item.value}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function SideSkillsSection({
  titleStyle,
  itemStyle,
  groups,
}: {
  titleStyle: Style;
  itemStyle: Style;
  groups: TailorResumePdfRequest["skillGroups"];
}) {
  if (!groups.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={titleStyle}>Skills</Text>
      <View style={{ marginTop: 6 }}>
        {groups.map((group) => (
          <View key={group.category} style={{ marginBottom: 8 }}>
            <Text style={[itemStyle, { fontWeight: 700 }]}>{group.category}:</Text>
            <Text style={itemStyle}>{group.items.join(", ")}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SideCertificationsSection({
  titleStyle,
  itemStyle,
  linkStyle,
  certs,
}: {
  titleStyle: Style;
  itemStyle: Style;
  linkStyle: Style;
  certs: TailorResumePdfRequest["certifications"];
}) {
  if (!certs.length) return null;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={titleStyle}>Certifications</Text>
      <View style={{ marginTop: 6 }}>
        {certs.map((c) => {
          const issuer = c.issuer ? ` — ${c.issuer}` : "";
          const href = c.credentialUrl ? normalizeUrl(c.credentialUrl) : null;
          if (href) {
            return (
              <Link key={c.name} src={href} style={[linkStyle, marginBottomStyle]}>
                {c.name}
                {issuer}
              </Link>
            );
          }
          return (
            <Text key={c.name} style={[itemStyle, marginBottomStyle]}>
              {c.name}
              {issuer}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function ExperienceSection({
  titleStyle,
  boxStyle,
  cardStyle,
  metaStyle,
  rowTitleStyle,
  bulletRowStyle,
  bulletDotStyle,
  bulletTextStyle,
  experiences,
}: {
  titleStyle: Style;
  boxStyle: Style;
  cardStyle: Style;
  metaStyle: Style;
  rowTitleStyle: Style;
  bulletRowStyle: Style;
  bulletDotStyle: Style;
  bulletTextStyle: Style;
  experiences: TailorResumePdfRequest["experiences"];
}) {
  if (!experiences.length) return null;
  return (
    <View style={boxStyle}>
      <Text style={titleStyle}>Experience</Text>
      <View style={cardStyle}>
        <View style={{ marginTop: 2 }}>
          {experiences.map((exp, idx) => (
            <View key={`${exp.role}|${exp.company}|${idx}`} style={{ marginBottom: 10 }}>
              <Text style={rowTitleStyle}>
                {exp.role} — {exp.company}
              </Text>
              {(exp.location || exp.period) ? (
                <Text style={metaStyle}>
                  {exp.location}
                  {exp.location && exp.period ? " — " : ""}
                  {exp.period}
                </Text>
              ) : null}
              {exp.bullets?.length ? (
                <View style={{ marginTop: 4 }}>
                  {exp.bullets.map((b, bIdx) => (
                    <View key={`${idx}:${bIdx}`} style={bulletRowStyle}>
                      <Text style={bulletDotStyle}>•</Text>
                      <Text style={bulletTextStyle}>{b}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function EducationSection({
  titleStyle,
  boxStyle,
  cardStyle,
  metaStyle,
  rowTitleStyle,
  education,
}: {
  titleStyle: Style;
  boxStyle: Style;
  cardStyle: Style;
  metaStyle: Style;
  rowTitleStyle: Style;
  education: TailorResumePdfRequest["education"];
}) {
  if (!education.length) return null;
  return (
    <View style={boxStyle}>
      <Text style={titleStyle}>Education</Text>
      <View style={cardStyle}>
        <View style={{ marginTop: 2 }}>
          {education.map((edu, idx) => (
            <View key={`${edu.school}|${idx}`} style={{ marginBottom: 8 }}>
              <Text style={rowTitleStyle}>{edu.degree}</Text>
              <Text style={metaStyle}>
                {edu.school}
                {edu.period ? ` — ${edu.period}` : ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ProjectsSection({
  titleStyle,
  boxStyle,
  cardStyle,
  metaStyle,
  rowTitleStyle,
  linkStyle,
  projects,
}: {
  titleStyle: Style;
  boxStyle: Style;
  cardStyle: Style;
  metaStyle: Style;
  rowTitleStyle: Style;
  linkStyle: Style;
  projects: TailorResumePdfRequest["projects"];
}) {
  if (!projects.length) return null;
  return (
    <View style={boxStyle}>
      <Text style={titleStyle}>Projects</Text>
      <View style={cardStyle}>
        <View style={{ marginTop: 2 }}>
          {projects.map((proj, idx) => {
            const href = proj.link ? normalizeUrl(proj.link) : null;
            return (
              <View key={`${proj.name}|${idx}`} style={{ marginBottom: 8 }}>
                {href ? (
                  <Link src={href} style={[rowTitleStyle, linkStyle]}>
                    {proj.name}
                  </Link>
                ) : (
                  <Text style={rowTitleStyle}>{proj.name}</Text>
                )}
                {proj.detail ? <Text style={metaStyle}>{proj.detail}</Text> : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function SkillsSection({
  titleStyle,
  boxStyle,
  cardStyle,
  groups,
}: {
  titleStyle: Style;
  boxStyle: Style;
  cardStyle: Style;
  groups: TailorResumePdfRequest["skillGroups"];
}) {
  if (!groups.length) return null;
  return (
    <View style={boxStyle}>
      <Text style={titleStyle}>Skills</Text>
      <View style={cardStyle}>
        <View style={{ marginTop: 2 }}>
          {groups.map((group) => (
            <Text key={group.category} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: 700 }}>{group.category}:</Text> {group.items.join(", ")}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function CertificationsSection({
  titleStyle,
  boxStyle,
  cardStyle,
  linkStyle,
  certs,
}: {
  titleStyle: Style;
  boxStyle: Style;
  cardStyle: Style;
  linkStyle: Style;
  certs: TailorResumePdfRequest["certifications"];
}) {
  if (!certs.length) return null;
  return (
    <View style={boxStyle}>
      <Text style={titleStyle}>Certifications</Text>
      <View style={cardStyle}>
        <View style={{ marginTop: 2 }}>
          {certs.map((c) => {
            const issuer = c.issuer ? ` — ${c.issuer}` : "";
            const href = c.credentialUrl ? normalizeUrl(c.credentialUrl) : null;
            if (href) {
              return (
                <Link key={c.name} src={href} style={[linkStyle, marginBottomStyle]}>
                  {c.name}
                  {issuer}
                </Link>
              );
            }
            return (
              <Text key={c.name} style={marginBottomStyle}>
                {c.name}
                {issuer}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}
