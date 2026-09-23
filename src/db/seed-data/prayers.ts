// A small curated prayer bank, matched by theme to the day's featured verse
// (see FEATURED_REFERENCES in ./books.ts). No API calls, no network
// dependency — fully deterministic and offline-capable, same as the verse
// and quote of the day.

export type PrayerTheme =
  | "hope"
  | "strength"
  | "trust"
  | "guidance"
  | "peace"
  | "courage"
  | "purpose"
  | "perseverance"
  | "wisdom"
  | "love"
  | "faith"
  | "work"
  | "gratitude"
  | "rest"
  | "anxiety";

export const PRAYERS: Record<PrayerTheme, { title: string; text: string }> = {
  hope: {
    title: "A Prayer for Hope",
    text:
      "Lord, when the road ahead feels uncertain, remind me that You already hold it. Thank You for plans that are good, even when I cannot yet see them. Steady my heart with hope today, and help me walk forward in trust rather than fear. Amen.",
  },
  strength: {
    title: "A Prayer for Strength",
    text:
      "Lord, I come to You tired in body or spirit, asking for strength that is not my own. Where I am weak, be my power; where I am running low, fill me again. Help me finish what today requires, leaning on You the whole way. Amen.",
  },
  trust: {
    title: "A Prayer for Trust",
    text:
      "Lord, quiet my need to understand everything before I obey. Help me trust You with what's uncertain, and rest in the truth that You are working even in what I cannot see. Keep me from leaning only on my own understanding today. Amen.",
  },
  guidance: {
    title: "A Prayer for Guidance",
    text:
      "Lord, direct my steps today — in the decisions that feel small and the ones that feel heavy. Where I'm unsure which way to go, make Your path plain to me. Help me listen more than I speak, and follow where You lead. Amen.",
  },
  peace: {
    title: "A Prayer for Peace",
    text:
      "Lord, still the noise in my mind and the tension in my body. Where there is conflict, worry, or unrest, let Your peace stand guard over my heart today. Help me carry a settled spirit into everything I face. Amen.",
  },
  courage: {
    title: "A Prayer for Courage",
    text:
      "Lord, when fear tries to hold me back, remind me that You go before me and stand beside me. Give me courage to do the hard, right thing today rather than shrink from it. I am not alone in this. Amen.",
  },
  purpose: {
    title: "A Prayer for Purpose",
    text:
      "Lord, help me not to drift through today but to walk it with intention. Renew my mind where it's grown numb to what matters, and align my priorities with Yours. Let my work today mean something beyond itself. Amen.",
  },
  perseverance: {
    title: "A Prayer for Perseverance",
    text:
      "Lord, when I want to quit, give me the will to keep going one more step. Turn this season of effort into something that shapes me for good. Thank You that no faithful labor is wasted, even when I can't yet see the harvest. Amen.",
  },
  wisdom: {
    title: "A Prayer for Wisdom",
    text:
      "Lord, I need wisdom I don't have on my own — for the choices in front of me and the people I'll meet today. Thank You that You give it generously when asked. Help me ask, and then help me actually listen. Amen.",
  },
  love: {
    title: "A Prayer for Love",
    text:
      "Lord, soften whatever has grown hard in me — impatience, judgment, self-protection. Help me love the people around me today the way You have loved me: patiently, generously, without keeping score. Amen.",
  },
  faith: {
    title: "A Prayer for Faith",
    text:
      "Lord, grow my faith even where I cannot see the outcome. Help me hold on to what I hope for and trust what I cannot yet prove, believing that You are faithful even in the waiting. Amen.",
  },
  work: {
    title: "A Prayer for My Work",
    text:
      "Lord, let today's work — however ordinary it feels — be done as an offering to You, not just a task to survive. Give me diligence without anxiety, and remind me who I'm really working for. Amen.",
  },
  gratitude: {
    title: "A Prayer of Gratitude",
    text:
      "Lord, before I ask for anything else today, thank You. Thank You for what has already been provided, for the people in my life, and for the small mercies I usually overlook. Keep my heart soft and thankful. Amen.",
  },
  rest: {
    title: "A Prayer for Rest",
    text:
      "Lord, I am weary, and I bring that weariness to You honestly. Teach me to rest in You, not just from exhaustion but from the need to carry everything myself. Let me lay this down and breathe today. Amen.",
  },
  anxiety: {
    title: "A Prayer for Anxiety",
    text:
      "Lord, I hand You what I've been carrying and gripping too tightly. Where anxious thoughts are loud, let Your peace be louder. Thank You that I don't have to face today's worries alone. Amen.",
  },
};

export function getPrayerForTheme(theme: PrayerTheme) {
  return PRAYERS[theme];
}
