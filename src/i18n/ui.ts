export type Locale = "sq" | "en";

export const locales: Locale[] = ["sq", "en"];

export const ogLocales: Record<Locale, string> = {
  sq: "sq_AL",
  en: "en_US",
};

export const ui = {
  sq: {
    siteName: "DuaCrypto News",
    home: "Kryefaqja",
    news: "Lajme",
    analysis: "Analiza",
    guides: "Udhëzues",
    community: "Komunitet",
    search: "Kërko",
    about: "Rreth nesh",
    mainSite: "Faqja kryesore",
    readInEnglish: "Lexo në anglisht",
    readInAlbanian: "Lexo në shqip",
    notTranslatedYet: "Ende pa përkthim — shiko të ngjashme në anglisht",
    notTranslatedYetEn: "Not translated yet — browse similar in English",
    requestTranslation: "Kërko përkthim",
    requestTranslationSent: "Faleminderit — e regjistruam kërkesën.",
    directAnswerLabel: "Përgjigje e shkurtër",
    faqTitle: "Pyetje të shpeshta",
    relatedPosts: "Artikuj të lidhur",
    minRead: "min lexim",
    updated: "Përditësuar",
    markdown: "Markdown",
    backHome: "Kthehu te lajmet",
    notFoundTitle: "404",
    notFoundBody: "Kjo faqe nuk ekziston.",
    searchTitle: "Kërko",
    searchDescription: "Kërko artikuj në DuaCrypto News.",
    featured: "Në fokus",
    browseCategory: "Shfleto sipas kategorisë",
    latestPosts: "Artikujt e fundit",
    heroTitle: "Bitcoin dhe Web3 nga Shqipëria dhe Ballkani",
    heroSubtitle:
      "Recap-e eventesh, udhëzues, analiza dhe histori komuniteti nga komuniteti i parë kripto në Shqipëri.",
    postsCount: "artikuj",
  },
  en: {
    siteName: "DuaCrypto News",
    home: "Home",
    news: "News",
    analysis: "Analysis",
    guides: "Guides",
    community: "Community",
    search: "Search",
    about: "About",
    mainSite: "Main site",
    readInEnglish: "Read in English",
    readInAlbanian: "Read in Albanian",
    notTranslatedYet: "Not translated yet — browse similar in English",
    notTranslatedYetEn: "Not translated yet — browse similar in English",
    requestTranslation: "Request translation",
    requestTranslationSent: "Thanks — we logged your request.",
    directAnswerLabel: "Quick answer",
    faqTitle: "FAQ",
    relatedPosts: "Related posts",
    minRead: "min read",
    updated: "Updated",
    markdown: "Markdown",
    backHome: "Back to news home",
    notFoundTitle: "404",
    notFoundBody: "That page doesn't exist.",
    searchTitle: "Search",
    searchDescription: "Search DuaCrypto News articles.",
    featured: "Featured",
    browseCategory: "Browse by category",
    latestPosts: "Latest posts",
    heroTitle: "Bitcoin & Web3 from Albania and the Balkans",
    heroSubtitle:
      "Event recaps, guides, analysis, and community stories — plus diaspora-focused crypto education.",
    postsCount: "posts",
  },
} as const;

export function t(locale: Locale) {
  return ui[locale];
}

export function localePrefix(locale: Locale): string {
  return locale === "en" ? "/en" : "";
}

export function localePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") {
    return normalized === "/" ? "/en/" : `/en${normalized}`;
  }
  return normalized;
}
