/** Apex animals: longevity habits and life principles. Facts are well-documented generalities, kept deliberately modest. */
export type Animal = {
  key: string;
  name: string;
  tagline: string;
  realm: string;
  facts: string[];
  lessons: string[];
  practise: string;
  rules: string;
  ruleNums: number[];
};

export const ANIMALS: Animal[] = [
  {
    key: "lion", name: "Lion", tagline: "Rest hard, hunt together", realm: "Savanna",
    facts: ["Rests most of the day, often 16 to 20 hours, and saves its energy for the hunt.", "Lionesses hunt as a coordinated team; the pride shares the work and the kill.", "Males defend territory with presence first and fighting last."],
    lessons: ["Recovery is part of the work, not a reward after it.", "Do the big effort with your team, not alone.", "Guard your territory (time, focus) before it is invaded."],
    practise: "Protect one real rest block today so tomorrow's effort is sharp.", rules: "Rules 7, 8, 14", ruleNums: [7, 8, 14],
  },
  {
    key: "leopard", name: "Leopard", tagline: "Adapt, and protect what you win", realm: "Forest to savanna",
    facts: ["Lives in more kinds of habitat than any other big cat, from deserts to rainforest.", "Hauls its kills up into trees so rivals cannot steal them.", "Hunts by ambush, close and quiet, rather than by long chases."],
    lessons: ["Adaptable people outlast specialists when conditions change.", "Secure the win: finish, save, publish, back it up.", "Quiet preparation beats noisy pursuit."],
    practise: "Finish and save one piece of work today so nothing you built can be lost.", rules: "Rules 6, 12, 13", ruleNums: [6, 12, 13],
  },
  {
    key: "cheetah", name: "Cheetah", tagline: "Sprint, then recover", realm: "Open grassland",
    facts: ["Fastest land animal, reaching roughly 100 km/h in short bursts.", "Overheats after a sprint and must rest and recover before eating.", "Many chases fail, and kills are often stolen by stronger predators."],
    lessons: ["Speed is for short, chosen bursts; no one sprints all day.", "Build recovery into the plan so one effort does not wreck the next.", "Choose the chases you can actually win."],
    practise: "Work one hard 90-minute sprint on your top task, then truly stop for 15 minutes.", rules: "Rules 6, 4", ruleNums: [6, 4],
  },
  {
    key: "tiger", name: "Tiger", tagline: "Fail often, keep going", realm: "Forest and grassland",
    facts: ["Solitary and patient; stalks close before it ever charges.", "Only a small fraction of its hunts succeed; one in ten is a commonly quoted rough figure.", "Needs a large territory, so it moves with purpose rather than wandering."],
    lessons: ["Most attempts fail even for the best; the winners attempt more.", "Get close before you commit: research, prepare, then strike.", "Persistence is a numbers game, not a mood."],
    practise: "Make one extra attempt today that you were about to skip: the call, the application, the rep.", rules: "Rules 5, 4, 15", ruleNums: [5, 4, 15],
  },
  {
    key: "eagle", name: "Golden eagle", tagline: "Rise above, spend little", realm: "Mountains and open country",
    facts: ["Sees prey from great distances, and soars on rising warm air to cover ground using little energy.", "Pairs often stay together for years and rebuild the same nests.", "Can live well over 20 years in the wild."],
    lessons: ["Get the high view: see the whole field before you move.", "Let the lift do the work; do not flap against the wind.", "Long partnerships and long projects are built by returning, season after season."],
    practise: "Spend 10 minutes on the big picture: what is the one outcome this week serves?", rules: "Rules 3, 6, 15", ruleNums: [3, 6, 15],
  },
  {
    key: "falcon", name: "Peregrine falcon", tagline: "Climb first, then strike", realm: "Cliffs and skies",
    facts: ["Dives from height at speeds over 300 km/h, the fastest of any animal.", "The speed comes from first climbing high and positioning itself.", "Recovered from near-extinction through protection and persistence."],
    lessons: ["Speed is earned by preparation and position.", "The dive looks sudden; the climb was the work.", "Comebacks are possible."],
    practise: "Do the setup that makes the hard task easy: open the file, lay out the plan, then go.", rules: "Rules 6, 8", ruleNums: [6, 8],
  },
  {
    key: "wolf", name: "Wolf", tagline: "The pack is the strength", realm: "Forest and tundra",
    facts: ["Hunts in packs, taking animals far larger than a single wolf could.", "Packs are mostly family, with older wolves teaching the young.", "A lone wolf has a much harder life than a pack member."],
    lessons: ["Surround yourself with people who share the hunt.", "Learn from those who have already done it.", "Isolation looks strong and wears you down."],
    practise: "Message one person in your pack today and ask for or give real help.", rules: "Rules 1, 12", ruleNums: [1, 12],
  },
  {
    key: "orca", name: "Orca", tagline: "Elders carry the wisdom", realm: "Open ocean",
    facts: ["Apex predator of the sea, hunting in coordinated family pods.", "Females can live 80 years or more, and older females are known to lead their pods.", "Hunting techniques are taught and passed between generations."],
    lessons: ["Knowledge compounds when it is shared and taught.", "Older and wiser people are a resource, not a relic.", "Strategy and teamwork beat raw size."],
    practise: "Learn one thing from someone older or more experienced than you, and note it down.", rules: "Rules 12, 14", ruleNums: [12, 14],
  },
  {
    key: "crocodile", name: "Crocodile", tagline: "Stillness is a strategy", realm: "Rivers and wetlands",
    facts: ["Waits motionless for long periods, then moves in a fraction of a second.", "Can go weeks or months between big meals thanks to a slow metabolism.", "Crocodilians have changed little for tens of millions of years."],
    lessons: ["Do not burn energy on things that do not feed you.", "Patience plus precision is cheaper than constant motion.", "What survives is often simple, tough and consistent."],
    practise: "Cut one pointless burst of busyness today, then act only on the one thing that matters.", rules: "Rules 1, 8, 10", ruleNums: [1, 8, 10],
  },
  {
    key: "polarbear", name: "Polar bear", tagline: "Endure the hard season", realm: "Arctic",
    facts: ["Waits for hours at a seal's breathing hole rather than chasing.", "Stores fat in good times to survive lean ones.", "Moves slowly to avoid overheating in the cold."],
    lessons: ["Store in the good season to survive the hard one.", "Wait where the opportunity will surface.", "Match your pace to your environment."],
    practise: "Put something aside today for your future self: money, a prepared meal, a finished draft.", rules: "Rules 9, 14", ruleNums: [9, 14],
  },
  {
    key: "elephant", name: "African elephant", tagline: "Memory, family and the long road", realm: "Savanna (apex of its landscape)",
    facts: ["Lives 60 to 70 years, among the longest of land mammals.", "Herds are led by an older matriarch whose memory guides them to water in dry years.", "Walks long distances daily, eats constantly and rests in the heat."],
    lessons: ["Longevity is mostly steady movement, steady eating and strong family.", "Remember what worked in the dry years.", "Lead by experience, not by force."],
    practise: "Take a real walk today and call one person from your family.", rules: "Rules 7, 9, 14", ruleNums: [7, 9, 14],
  },
  {
    key: "shark", name: "Great white shark", tagline: "Keep moving forward", realm: "Open ocean",
    facts: ["Relies largely on swimming forward to push water over its gills.", "Can live about 70 years.", "Patrols wide areas and strikes from below with a single committed attack."],
    lessons: ["Momentum keeps you alive; stalling is the risk.", "Small steady movement beats waiting for perfect conditions.", "When you commit, commit fully."],
    practise: "Make one forward move on the project you have been avoiding, even for five minutes.", rules: "Rules 5, 13", ruleNums: [5, 13],
  },
];

export type Principle = { title: string; body: string; ruleNums: number[]; rules: string };

/** What the long-lived animals have in common. */
export const LONGEVITY: Principle[] = [
  { title: "Keep an energy budget", body: "Lions rest most of the day, crocodiles go months between meals, polar bears wait instead of chase. Long-lived animals do not spend energy they cannot afford. Cut the low-value drain so there is fuel for the real hunt.", ruleNums: [1, 8, 14], rules: "Rules 1, 8, 14" },
  { title: "Recover as seriously as you work", body: "The cheetah's sprint is followed by rest. Recovery is when the body repairs. Train hard, then sleep and eat like it counts, because it does.", ruleNums: [7, 9, 14], rules: "Rules 7, 9, 14" },
  { title: "Keep moving every day", body: "Elephants walk for miles; sharks keep swimming. A little movement daily protects you more than rare heroic efforts.", ruleNums: [7], rules: "Rule 7" },
  { title: "Stay in your pack and listen to your elders", body: "Wolf packs, orca pods and elephant herds survive on shared knowledge. Isolation shortens lives; community and mentors lengthen them.", ruleNums: [1, 12], rules: "Rules 1, 12" },
  { title: "Pick your hunts and finish them", body: "Even tigers fail most of the time. Choose fights you can win, accept the misses, and protect the wins you land.", ruleNums: [5, 6, 13], rules: "Rules 5, 6, 13" },
];

/** Animal of the day, rotating through the list by calendar day. */
export function animalForDay(dayISO: string): Animal {
  const days = Math.floor(Date.parse(dayISO + "T00:00:00Z") / 86400000);
  return ANIMALS[((days % ANIMALS.length) + ANIMALS.length) % ANIMALS.length];
}
