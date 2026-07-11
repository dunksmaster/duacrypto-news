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
    mainSite: "duacrypto.com ↗",
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
    zap: "Zap",
    zapTitle: "Lightning zap",
    zapHint: "Copy the invoice below into your Lightning wallet (Alby, Phoenix, etc.).",
    zapCopyInvoice: "Kopjo faturën",
    zapClose: "Mbyll",
    nostrTitle: "Nostr",
    nostrHint: "Lexo dhe ndaj në Nostr — rrjeti social i decentralizuar.",
    nostrViewNote: "Shiko shënimin",
    nostrFollow: "Ndiq DuaCrypto",
    geoBannerLabel: "Sugjerim gjuhe",
    geoBannerText: "Duket se lexon nga jashtë — versioni anglisht mund të të përshtatet më mirë.",
    geoBannerSwitch: "Shko te English",
    geoBannerDismiss: "Jo tani",
    trustTelegramMembers: " anëtarë në Telegram",
    trustSince: "Që prej",
    trustJoinTelegram: "Bashkohu në Telegram",
    popularPosts: "Më të lexuarat",
    viewAll: "Shiko të gjitha",
    aboutAuthor: "Rreth",
    aboutAuthorPage: "Faqja e autorit",
    newsletterInlineLabel: "Newsletter",
    newsletterInlineTitle: "Dua më shumë se një artikull?",
    newsletterInlineBody: "Premium Newsletter ($10/muaj) — analiza, recap-e dhe udhëzime që nuk i publikojmë kudo.",
    newsletterInlineCta: "Shiko Premium →",
    tocLabel: "Në këtë artikull",
    prevPost: "Artikulli i mëparshëm",
    nextPost: "Artikulli tjetër",
    postNavLabel: "Navigim artikujsh",
    keyTakeawaysLabel: "Çka mëson këtu",
    heroKicker: "NË FOKUS",
    readGuideCta: "LEXO UDHËZUESIN →",
    sidebarBrowse: "SHFLETO SIPAS KATEGORISË",
    donateLabel: "₿ NDIHMO KOMUNITETIN",
    donateBody: "Mbështet edukimin falas në shqip me sats mbi Lightning.",
    donateCta: "⚡ DËRGO SATS",
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
    mainSite: "duacrypto.com ↗",
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
    zap: "Zap",
    zapTitle: "Lightning zap",
    zapHint: "Copy the invoice below into your Lightning wallet (Alby, Phoenix, etc.).",
    zapCopyInvoice: "Copy invoice",
    zapClose: "Close",
    nostrTitle: "Nostr",
    nostrHint: "Read and share on Nostr — the decentralized social layer.",
    nostrViewNote: "View note",
    nostrFollow: "Follow DuaCrypto",
    geoBannerLabel: "Language suggestion",
    geoBannerText: "Reading from abroad? The English edition may suit you better.",
    geoBannerSwitch: "Switch to English",
    geoBannerDismiss: "Not now",
    trustTelegramMembers: " Telegram members",
    trustSince: "Since",
    trustJoinTelegram: "Join Telegram",
    popularPosts: "Most read",
    viewAll: "View all",
    aboutAuthor: "About",
    aboutAuthorPage: "Author page",
    newsletterInlineLabel: "Newsletter",
    newsletterInlineTitle: "Want more than one article?",
    newsletterInlineBody: "Premium Newsletter ($10/mo) — analysis, recaps, and guides we don't publish everywhere.",
    newsletterInlineCta: "See Premium →",
    tocLabel: "In this article",
    prevPost: "Previous article",
    nextPost: "Next article",
    postNavLabel: "Post navigation",
    keyTakeawaysLabel: "What you'll learn",
    heroKicker: "IN FOCUS",
    readGuideCta: "READ THE GUIDE →",
    sidebarBrowse: "BROWSE BY CATEGORY",
    donateLabel: "₿ SUPPORT THE COMMUNITY",
    donateBody: "Support free education with sats over Lightning.",
    donateCta: "⚡ SEND SATS",
  },
} as const;

export function t(locale: Locale) {
  return ui[locale];
}

/** Localized category label (never use English site.json labels on SQ pages). */
export function categoryLabel(
  category: string,
  locale: Locale,
): string {
  const strings = t(locale);
  const map: Record<string, string> = {
    news: strings.news,
    analysis: strings.analysis,
    guides: strings.guides,
    community: strings.community,
  };
  return map[category] ?? category;
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
