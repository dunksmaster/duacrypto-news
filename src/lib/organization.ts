/**
 * Organization entity — consistent across all pages for E-E-A-T and GEO.
 */
export const organization = {
  name: "DuaCrypto",
  url: "https://duacrypto.com",
  logo: "https://news.duacrypto.com/img/duacrypto-logo.png",
  sameAs: [
    "https://t.me/dua_crypto",
    "https://github.com/dunksmaster/TokenDC",
    "https://duacrypto.gumroad.com/l/newsletter",
  ],
};

export const authorDua = {
  name: "Dua",
  url: "https://news.duacrypto.com/authors/dua/",
  jobTitle: "Founder, DuaCrypto — Bitcoin & Web3 community, Albania",
  image: "https://duacrypto.com/img/kane-profile.png",
  sameAs: [
    "https://t.me/dua_crypto",
    "https://x.com/duacrypto",
    "https://duacrypto.com/about.html",
    "https://github.com/dunksmaster/TokenDC",
  ],
};

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    name: organization.name,
    url: organization.url,
    logo: organization.logo,
    sameAs: organization.sameAs,
  };
}

export function personAuthorJsonLd() {
  return {
    "@type": "Person",
    name: authorDua.name,
    url: authorDua.url,
    image: authorDua.image,
    jobTitle: authorDua.jobTitle,
    sameAs: authorDua.sameAs,
    worksFor: { "@type": "Organization", name: organization.name, url: organization.url },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  if (!faq.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function howToJsonLd(
  name: string,
  description: string,
  steps: { name: string; text: string }[],
) {
  if (!steps.length) return null;
  return {
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function blogPostingJsonLd(opts: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  pubDate: Date;
  updatedDate?: Date;
  lang?: string;
}) {
  const { title, description, canonicalUrl, ogImage, pubDate, updatedDate, lang } = opts;
  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    inLanguage: lang === "sq" ? "sq-AL" : "en",
    author: personAuthorJsonLd(),
    publisher: {
      ...organizationJsonLd(),
      logo: { "@type": "ImageObject", url: organization.logo },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 675,
    },
  };
}
