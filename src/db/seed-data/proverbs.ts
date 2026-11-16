/**
 * Key paths of guidance from the Book of Proverbs (KJV, public domain).
 * Verse text is copied from the app's KJV data so nothing here is paraphrased.
 */
export const PROVERBS_BOOK_ID = 20; // Proverbs in the app's Bible reader
export type ProverbsPath = { key: string; title: string; summary: string; rules: string; ruleNums: number[]; verses: string[]; practise: string };
/** Verse text by reference, e.g. "16:32" (Proverbs chapter:verse). */
export const VERSES: Record<string, string> = {
  "1:7": "The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.",
  "1:8": "My son, hear the instruction of thy father, and forsake not the law of thy mother:",
  "2:6": "For the LORD giveth wisdom: out of his mouth cometh knowledge and understanding.",
  "3:5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
  "3:6": "In all thy ways acknowledge him, and he shall direct thy paths.",
  "3:7": "Be not wise in thine own eyes: fear the LORD, and depart from evil.",
  "3:9": "Honour the LORD with thy substance, and with the firstfruits of all thine increase:",
  "3:24": "When thou liest down, thou shalt not be afraid: yea, thou shalt lie down, and thy sleep shall be sweet.",
  "3:27": "Withhold not good from them to whom it is due, when it is in the power of thine hand to do it.",
  "4:7": "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.",
  "4:14": "Enter not into the path of the wicked, and go not in the way of evil men.",
  "4:18": "But the path of the just is as the shining light, that shineth more and more unto the perfect day.",
  "4:23": "Keep thy heart with all diligence; for out of it are the issues of life.",
  "4:25": "Let thine eyes look right on, and let thine eyelids look straight before thee.",
  "4:26": "Ponder the path of thy feet, and let all thy ways be established.",
  "6:6": "Go to the ant, thou sluggard; consider her ways, and be wise:",
  "9:9": "Give instruction to a wise man, and he will be yet wiser: teach a just man, and he will increase in learning.",
  "10:4": "He becometh poor that dealeth with a slack hand: but the hand of the diligent maketh rich.",
  "10:9": "He that walketh uprightly walketh surely: but he that perverteth his ways shall be known.",
  "10:19": "In the multitude of words there wanteth not sin: but he that refraineth his lips is wise.",
  "11:3": "The integrity of the upright shall guide them: but the perverseness of transgressors shall destroy them.",
  "11:14": "Where no counsel is, the people fall: but in the multitude of counsellors there is safety.",
  "11:25": "The liberal soul shall be made fat: and he that watereth shall be watered also himself.",
  "12:1": "Whoso loveth instruction loveth knowledge: but he that hateth reproof is brutish.",
  "12:15": "The way of a fool is right in his own eyes: but he that hearkeneth unto counsel is wise.",
  "12:22": "Lying lips are abomination to the LORD: but they that deal truly are his delight.",
  "13:4": "The soul of the sluggard desireth, and hath nothing: but the soul of the diligent shall be made fat.",
  "13:11": "Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.",
  "13:20": "He that walketh with wise men shall be wise: but a companion of fools shall be destroyed.",
  "14:12": "There is a way which seemeth right unto a man, but the end thereof are the ways of death.",
  "14:23": "In all labour there is profit: but the talk of the lips tendeth only to penury.",
  "14:29": "He that is slow to wrath is of great understanding: but he that is hasty of spirit exalteth folly.",
  "14:30": "A sound heart is the life of the flesh: but envy the rottenness of the bones.",
  "15:1": "A soft answer turneth away wrath: but grievous words stir up anger.",
  "15:18": "A wrathful man stirreth up strife: but he that is slow to anger appeaseth strife.",
  "15:22": "Without counsel purposes are disappointed: but in the multitude of counsellors they are established.",
  "15:32": "He that refuseth instruction despiseth his own soul: but he that heareth reproof getteth understanding.",
  "16:3": "Commit thy works unto the LORD, and thy thoughts shall be established.",
  "16:9": "A man's heart deviseth his way: but the LORD directeth his steps.",
  "16:18": "Pride goeth before destruction, and an haughty spirit before a fall.",
  "16:32": "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.",
  "17:17": "A friend loveth at all times, and a brother is born for adversity.",
  "17:22": "A merry heart doeth good like a medicine: but a broken spirit drieth the bones.",
  "17:28": "Even a fool, when he holdeth his peace, is counted wise: and he that shutteth his lips is esteemed a man of understanding.",
  "18:10": "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.",
  "18:15": "The heart of the prudent getteth knowledge; and the ear of the wise seeketh knowledge.",
  "18:21": "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof.",
  "19:11": "The discretion of a man deferreth his anger; and it is his glory to pass over a transgression.",
  "19:17": "He that hath pity upon the poor lendeth unto the LORD; and that which he hath given will he pay him again.",
  "19:21": "There are many devices in a man's heart; nevertheless the counsel of the LORD, that shall stand.",
  "20:1": "Wine is a mocker, strong drink is raging: and whosoever is deceived thereby is not wise.",
  "20:7": "The just man walketh in his integrity: his children are blessed after him.",
  "21:5": "The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.",
  "21:20": "There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up.",
  "21:23": "Whoso keepeth his mouth and his tongue keepeth his soul from troubles.",
  "22:7": "The rich ruleth over the poor, and the borrower is servant to the lender.",
  "22:29": "Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.",
  "23:20": "Be not among winebibbers; among riotous eaters of flesh:",
  "23:22": "Hearken unto thy father that begat thee, and despise not thy mother when she is old.",
  "24:10": "If thou faint in the day of adversity, thy strength is small.",
  "24:16": "For a just man falleth seven times, and riseth up again: but the wicked shall fall into mischief.",
  "24:27": "Prepare thy work without, and make it fit for thyself in the field; and afterwards build thine house.",
  "25:28": "He that hath no rule over his own spirit is like a city that is broken down, and without walls.",
  "27:6": "Faithful are the wounds of a friend; but the kisses of an enemy are deceitful.",
  "27:17": "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.",
  "27:23": "Be thou diligent to know the state of thy flocks, and look well to thy herds.",
  "28:13": "He that covereth his sins shall not prosper: but whoso confesseth and forsaketh them shall have mercy.",
  "29:11": "A fool uttereth all his mind: but a wise man keepeth it in till afterwards.",
  "29:18": "Where there is no vision, the people perish: but he that keepeth the law, happy is he."
};
export const PROVERBS_PATHS: ProverbsPath[] = [
  {
    "key": "wisdom",
    "title": "Wisdom and learning",
    "summary": "Start with reverence, then keep learning. Wisdom is the first purchase, not an extra.",
    "rules": "Rules 3, 13",
    "ruleNums": [
      3,
      13
    ],
    "verses": [
      "1:7",
      "4:7",
      "2:6",
      "18:15",
      "9:9"
    ],
    "practise": "Read one chapter or lesson today and write one thing you will use."
  },
  {
    "key": "diligence",
    "title": "Diligence and work",
    "summary": "The hands that keep showing up are the ones that get paid. Laziness always looks comfortable at the time.",
    "rules": "Rules 6, 8",
    "ruleNums": [
      6,
      8
    ],
    "verses": [
      "6:6",
      "10:4",
      "13:4",
      "14:23",
      "21:5",
      "22:29"
    ],
    "practise": "Do your deep-work block first, before anything easy."
  },
  {
    "key": "discipline",
    "title": "Self-control and discipline",
    "summary": "Mastering yourself is worth more than conquering anything outside. No walls means no defence.",
    "rules": "Rules 4, 5, 10",
    "ruleNums": [
      4,
      5,
      10
    ],
    "verses": [
      "16:32",
      "25:28",
      "29:11",
      "23:20",
      "20:1"
    ],
    "practise": "Name the one urge you will not feed today, and remove access."
  },
  {
    "key": "temptation",
    "title": "Temptation and the path you walk",
    "summary": "Stay off the road that leads to the vice, and watch where your eyes and feet go.",
    "rules": "Rule 10",
    "ruleNums": [
      10
    ],
    "verses": [
      "4:14",
      "4:25",
      "4:26",
      "14:12"
    ],
    "practise": "Block one door today that your vice walks through."
  },
  {
    "key": "speech",
    "title": "Words and silence",
    "summary": "Fewer words, softer answers, and quiet instead of announcing plans. Your tongue steers a lot of your life.",
    "rules": "Rules 1, 2",
    "ruleNums": [
      1,
      2
    ],
    "verses": [
      "10:19",
      "15:1",
      "17:28",
      "18:21",
      "21:23"
    ],
    "practise": "Share nothing about your plans today. Show results later."
  },
  {
    "key": "humility",
    "title": "Correction, humility and owning it",
    "summary": "Wise people take correction and own their part. Hiding mistakes stalls you; confessing them moves you.",
    "rules": "Rule 2",
    "ruleNums": [
      2
    ],
    "verses": [
      "12:1",
      "15:32",
      "28:13",
      "16:18",
      "27:6"
    ],
    "practise": "Write the three lines for one setback: what happened, my part, next time."
  },
  {
    "key": "planning",
    "title": "Planning and goals",
    "summary": "Commit the plan, prepare the work first, and keep a clear vision of the target.",
    "rules": "Rules 6, 15",
    "ruleNums": [
      6,
      15
    ],
    "verses": [
      "16:3",
      "16:9",
      "24:27",
      "29:18",
      "19:21"
    ],
    "practise": "Write tomorrow's first task before you stop today."
  },
  {
    "key": "money",
    "title": "Money and provision",
    "summary": "Honour God first, earn by honest work, know where your money is going, and avoid debt that owns you.",
    "rules": "Rules 12, 14",
    "ruleNums": [
      12,
      14
    ],
    "verses": [
      "3:9",
      "13:11",
      "21:20",
      "22:7",
      "27:23"
    ],
    "practise": "Check one number today: what you spent against your budget."
  },
  {
    "key": "counsel",
    "title": "Friends, counsel and company",
    "summary": "You become like the people you spend time with. Seek advice, and keep people who sharpen you.",
    "rules": "Rules 1, 12",
    "ruleNums": [
      1,
      12
    ],
    "verses": [
      "13:20",
      "27:17",
      "15:22",
      "11:14",
      "17:17",
      "12:15"
    ],
    "practise": "Message one person ahead of you in what you want and ask one question."
  },
  {
    "key": "integrity",
    "title": "Integrity and trust",
    "summary": "Doing the right thing when no one is watching is what makes your life steady.",
    "rules": "Rules 14, 15",
    "ruleNums": [
      14,
      15
    ],
    "verses": [
      "10:9",
      "11:3",
      "12:22",
      "20:7"
    ],
    "practise": "Keep one small promise you made to yourself today."
  },
  {
    "key": "heart",
    "title": "Heart, rest and health",
    "summary": "Guard your inner life. Cheerfulness helps your body, and sleep is part of the work.",
    "rules": "Rules 9, 14",
    "ruleNums": [
      9,
      14
    ],
    "verses": [
      "4:23",
      "17:22",
      "14:30",
      "3:7",
      "3:24"
    ],
    "practise": "Be in bed on time tonight and keep the phone out of the room."
  },
  {
    "key": "trust",
    "title": "Trusting God with the plan",
    "summary": "Do your part fully, then trust God with the outcome. Plans are made by people, outcomes are held by Him.",
    "rules": "Rules 3, 15",
    "ruleNums": [
      3,
      15
    ],
    "verses": [
      "3:5",
      "3:6",
      "16:3",
      "18:10",
      "19:21"
    ],
    "practise": "Pray over the one hard thing you are facing, then do the next step."
  },
  {
    "key": "perseverance",
    "title": "Getting back up",
    "summary": "Falling is not the failure. Staying down is. Small strength in a hard day is still strength.",
    "rules": "Rules 5, 15",
    "ruleNums": [
      5,
      15
    ],
    "verses": [
      "24:16",
      "24:10",
      "4:18",
      "28:13"
    ],
    "practise": "If you missed yesterday, do the minimum version today. Never miss twice."
  },
  {
    "key": "patience",
    "title": "Patience and anger",
    "summary": "Slow to anger is a mark of strength. Hold your reply until you have thought.",
    "rules": "Rules 4, 14",
    "ruleNums": [
      4,
      14
    ],
    "verses": [
      "14:29",
      "15:18",
      "19:11",
      "29:11",
      "16:32"
    ],
    "practise": "Pause for one breath before your next reply when you feel irritated."
  },
  {
    "key": "generosity",
    "title": "Generosity and family",
    "summary": "Open-handed people are enriched, and honouring your parents keeps your roots. Call home.",
    "rules": "Rule 14",
    "ruleNums": [
      14
    ],
    "verses": [
      "11:25",
      "19:17",
      "3:27",
      "1:8",
      "23:22"
    ],
    "practise": "Do one useful thing for someone today, and call home."
  }
];
/** When you feel…, read this. */
export const MOMENTS: { feel: string; ref: string }[] = [
  {
    "feel": "I can't be bothered",
    "ref": "6:6"
  },
  {
    "feel": "I want to quit",
    "ref": "24:16"
  },
  {
    "feel": "I'm angry",
    "ref": "15:1"
  },
  {
    "feel": "I'm tempted",
    "ref": "4:14"
  },
  {
    "feel": "I feel anxious about the outcome",
    "ref": "3:5"
  },
  {
    "feel": "I'm tired of being alone in this",
    "ref": "17:17"
  },
  {
    "feel": "I made a mistake",
    "ref": "28:13"
  },
  {
    "feel": "I'm comparing myself",
    "ref": "14:30"
  }
];
export const refLabel = (ref: string) => `Proverbs ${ref}`;
/** Proverbs has 31 chapters: read the one matching the day of the month. */
export const chapterForDay = (dayISO: string) => Number(dayISO.slice(8, 10));
