/**
 * The Ten Pillars: "an athlete's body, a Stoic's mind ... God's wisdom".
 * Each pillar is expanded with practices drawn from named sources (Stoic texts, sports science,
 * military doctrine, strategy, attention research, psychology and Scripture).
 * Scripture is KJV (public domain). Other sources are paraphrased, never quoted at length.
 */
export type Pillar = {
  n: number;
  key: string;
  line: string; // "An athlete's body"
  title: string; // short label
  essence: string;
  why: string;
  principles: { t: string; b: string }[];
  daily: string[];
  weekly: string[];
  minimum: string; // the one-line daily floor, used as the checkbox label
  mistakes: string[];
  measure: string[];
  reading: { t: string; by: string }[];
  verse: { ref: string; text: string };
  animal: string;
  ruleNums: number[];
  rules: string;
  links: { label: string; href: string }[];
};

export const PILLARS: Pillar[] = [
  {
    n: 1, key: "athlete", line: "An athlete's body", title: "Body", animal: "Elephant and lion",
    essence: "Strength, stamina and recovery you can rely on at 25 and at 75.",
    why: "Everything else you want to do runs on this machine. Strength and fitness are among the strongest predictors of how long and how well people live, and the body is also the first place self-respect is proven.",
    principles: [
      { t: "Strength first", b: "Train the big movements (squat or leg press, hinge, push, pull, carry) two to four times a week and add a little load or a rep over time. Muscle and grip strength are consistently linked with lower risk of early death and with staying independent as you age." },
      { t: "Build an aerobic engine", b: "Do two or three easy sessions a week at a pace where you can still talk (often called zone 2), 30 to 60 minutes each, plus one short hard session such as 4 x 4 minutes. A high level of cardiorespiratory fitness is one of the best-documented markers of longevity." },
      { t: "Sleep is training", b: "Aim for 7 to 9 hours on a fixed schedule. Muscle repair, hormone balance, mood and memory consolidation all happen here. Protect the last hour before bed from screens and heavy meals." },
      { t: "Feed the work", b: "Eat enough protein (roughly 1.6 g per kg of body weight a day is a well-supported target for building muscle), plenty of whole food, and enough water. Plan meals ahead so willpower is not doing the work." },
      { t: "Move all day, not just in the gym", b: "A sedentary day undoes much of a good workout. Walk after meals, take stairs, stand and stretch every hour. Daily steps in the several thousands are linked with lower mortality." },
      { t: "Deload and listen", b: "Every fourth or fifth week, cut volume by about a third. Pain that is sharp, joint-based or lasting is a stop sign, not a challenge. Athletes last by being consistent for decades, not heroic for a month." },
    ],
    daily: ["Move your body for at least 20 minutes (train, run, walk briskly)", "Eat protein at every meal and drink water", "Lights out at your fixed time", "Two minutes of mobility for hips, spine and shoulders"],
    weekly: ["3 to 4 sessions logged (at least 2 strength)", "1 easy long walk or aerobic session", "Weigh or measure once, same day and time", "Plan and prep next week's meals"],
    minimum: "Trained or walked 20+ minutes",
    mistakes: ["Skipping sleep to train", "Only cardio or only lifting", "Ego lifting that ends in injury", "Treating rest weeks as laziness", "Changing the programme every two weeks"],
    measure: ["Sessions per week", "Sleep hours (7-day average)", "One key lift or run time every month", "Waist circumference and morning energy"],
    reading: [{ t: "Outlive", by: "Peter Attia" }, { t: "Starting Strength", by: "Mark Rippetoe" }, { t: "Atomic Habits", by: "James Clear" }],
    verse: { ref: "1 Corinthians 6:19", text: "What? know ye not that your body is the temple of the Holy Ghost which is in you, which ye have of God, and ye are not your own?" },
    ruleNums: [7, 9, 14], rules: "Rules 7, 9, 14",
    links: [{ label: "Habits", href: "/habits" }, { label: "Progress", href: "/progress" }],
  },
  {
    n: 2, key: "stoic", line: "A Stoic's mind", title: "Mind", animal: "Crocodile",
    essence: "Calm, clear judgement that circumstances cannot take from you.",
    why: "Stoicism gave later psychology some of its tools: the founders of modern cognitive therapy openly credited the Stoics. Between what happens and how you respond there is a gap, and these practices widen it.",
    principles: [
      { t: "Sort what is up to you", b: "Epictetus opens his Enchiridion with the core move: some things are up to us (our judgements, choices, effort) and some are not (other people, outcomes, the past, the weather). Spend your energy only on the first group." },
      { t: "Pause before you assent", b: "A feeling arrives as an impression. You do not have to agree with it at once. Ask: is this true, is it useful, is it mine to control? Then answer. The gap is the whole skill." },
      { t: "Rehearse the setback", b: "Seneca recommends premeditatio malorum: picture what could go wrong, and how you would respond well. It does not make you gloomy; it takes away the shock and leaves a plan." },
      { t: "Turn the obstacle into the path", b: "Marcus Aurelius wrote that what blocks the way becomes the way. Ask of every setback: what virtue does this make possible (patience, courage, creativity)?" },
      { t: "Practise small discomforts", b: "Seneca suggested setting aside a few days to live on plain food and rough clothes, so that fear of loss shrinks. Cold shower, a skipped meal, a hard walk: choose discomfort on purpose so it cannot rule you by surprise." },
      { t: "Remember your limits", b: "Memento mori is not morbid. If time is short, the petty argument and the scroll look as small as they are. It sharpens priorities and gratitude." },
      { t: "Review the day", b: "Seneca describes ending each day by asking what he did badly, what he did well, and what he left undone, without harshness. Learn, forgive, adjust." },
    ],
    daily: ["Morning: name one thing that could go wrong today and how you will respond well", "When upset, ask 'is this up to me?' and write the answer in one line", "One deliberate small discomfort (cold shower finish, standing instead of sitting, delayed treat)", "Evening review: what went well, what went badly, what did I leave undone?"],
    weekly: ["Read 10 to 15 pages of a Stoic text", "Write a 'view from above' paragraph: how big will this matter in five years?", "Review which frustrations were outside your control and drop them"],
    minimum: "Did the morning premeditation or evening review",
    mistakes: ["Treating Stoicism as suppressing feelings (it is about judging them well)", "Using it to excuse passivity", "Reading quotes without practising", "Trying to control other people's reactions"],
    measure: ["Evenings reviewed this week", "Number of times you paused before reacting", "Your own 1 to 5 rating of 'calm under pressure' each Sunday"],
    reading: [{ t: "Meditations", by: "Marcus Aurelius" }, { t: "Enchiridion (Handbook)", by: "Epictetus" }, { t: "Letters from a Stoic", by: "Seneca" }, { t: "The Obstacle Is the Way", by: "Ryan Holiday" }],
    verse: { ref: "Proverbs 16:32", text: "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city." },
    ruleNums: [2, 4, 10], rules: "Rules 2, 4, 10",
    links: [{ label: "Journal", href: "/journal" }, { label: "Mantras", href: "/mantras" }],
  },
  {
    n: 3, key: "soldier", line: "A soldier's discipline", title: "Discipline", animal: "Wolf",
    essence: "Doing what you said you would do, long after the mood has gone.",
    why: "Discipline is the bridge between plans and results. Soldiers do not rely on feeling ready; they rely on standards, routine and each other. You are your own commanding officer, and your word to yourself is the order.",
    principles: [
      { t: "Standards beat motivation", b: "Motivation fades; standards do not. Decide the non-negotiables in advance (wake time, training, work block, shutdown) and treat them as orders, not suggestions." },
      { t: "Win the first small battle", b: "Admiral McRaven's famous advice is to make your bed: one finished task at dawn sets the pattern for the day. Pick a small, visible first win and do it before anything else." },
      { t: "Discipline equals freedom", b: "Jocko Willink's idea: the more disciplined your routine, the more freedom you gain in money, health and time. Discipline is a trade of short-term comfort for long-term options." },
      { t: "Plan if-then", b: "Implementation intentions ('if it is 6:00, then I put on my shoes') are among the best-supported ways to turn intention into action. Write your if-thens for the moments you usually fail." },
      { t: "Never miss twice", b: "Missing once is human; missing twice starts a new habit. Have a minimum version of every standard (5 push-ups, 5 minutes of work) so that you keep the chain even on bad days." },
      { t: "After-action review", b: "Military units run a short debrief: what was supposed to happen, what did happen, why, what will we sustain, what will we change. Run it nightly on yourself, factually, with no self-hate." },
      { t: "Own it", b: "Extreme ownership means no blaming conditions, people or tools. If it is your plan, it is your problem to fix. Ownership is the most freeing posture there is." },
      { t: "Prepare the night before", b: "Gear laid out, bag packed, top three tasks written. Discipline is mostly decisions made when you were calm." },
    ],
    daily: ["Make your bed and do your first scheduled task without negotiating", "Write the top three tasks the night before", "Do the hardest thing before noon", "Night: after-action review in 3 lines (plan, reality, fix)"],
    weekly: ["Count your 'never miss twice' saves", "Adjust one standard that is too soft or too brutal", "Tidy your environment so the right action is the easy one"],
    minimum: "Followed my timetable and did the hard thing first",
    mistakes: ["Waiting to feel ready", "All-or-nothing: one miss becomes a lost week", "Standards so extreme they collapse in a week", "No review, so the same failure repeats"],
    measure: ["Days on the timetable (see Today tab)", "Longest 'never miss twice' streak", "Missed days per month, goal 2 or fewer and never two in a row"],
    reading: [{ t: "Discipline Equals Freedom", by: "Jocko Willink" }, { t: "Extreme Ownership", by: "Jocko Willink and Leif Babin" }, { t: "Make Your Bed", by: "William H. McRaven" }, { t: "The Checklist Manifesto", by: "Atul Gawande" }],
    verse: { ref: "2 Timothy 2:3", text: "Thou therefore endure hardness, as a good soldier of Jesus Christ." },
    ruleNums: [4, 5, 8], rules: "Rules 4, 5, 8",
    links: [{ label: "Todos", href: "/todos" }, { label: "Habits", href: "/habits" }],
  },
  {
    n: 4, key: "strategist", line: "A strategist's vision", title: "Vision", animal: "Golden eagle",
    essence: "Seeing the whole field, choosing the decisive move, and sequencing the rest.",
    why: "Effort without direction is just busyness. A strategist knows the end state, the constraints, the few levers that matter, and what to ignore. Vision also keeps discipline from becoming mere stubbornness.",
    principles: [
      { t: "Define the win in one sentence", b: "Write a target with a number and a date. Rumelt's Good Strategy Bad Strategy says a real strategy has a diagnosis, a guiding policy and coherent actions, not a list of wishes." },
      { t: "Know yourself and the terrain", b: "Sun Tzu's central counsel is to know yourself and know the opponent or terrain. Map your strengths, constraints, resources and the real obstacles before moving." },
      { t: "Invert", b: "Charlie Munger popularised Jacobi's advice to invert: ask what would guarantee failure, then avoid it. Listing the ways to ruin a goal is often easier and sharper than listing the ways to achieve it." },
      { t: "Run a pre-mortem", b: "Psychologist Gary Klein's technique: imagine the plan failed a year from now, and write down why. It surfaces risks people were too polite or optimistic to name." },
      { t: "Think in second-order effects", b: "Ask 'and then what?' at least twice. Many choices that feel good now have costly consequences later; some painful ones pay off. Investors such as Howard Marks stress this." },
      { t: "Cycle fast through the loop", b: "John Boyd's OODA loop (observe, orient, decide, act) says the side that cycles through information and action faster adapts better. Short weekly reviews are your loop." },
      { t: "Pick a few decisive objectives", b: "Choose one to three outcomes per quarter. Everything else is either support or noise. Use leading indicators (inputs you control) next to lagging results." },
      { t: "Keep a decision journal", b: "Write what you decided, why, what you expected and your confidence. Later you can separate bad luck from bad judgement (Annie Duke's Thinking in Bets)." },
    ],
    daily: ["Re-read your one-sentence target and your 'why' (rule 3)", "Pick the single task that moves the target the most", "Note one 'and then what?' consequence for a decision you are making"],
    weekly: ["Sunday: review, score, choose next week's top three outcomes", "Run a 10-minute pre-mortem on your most important plan", "Update your decision journal and one lesson"],
    minimum: "Wrote my target and picked the one decisive task",
    mistakes: ["Planning forever and never acting", "Too many priorities", "Confusing activity with progress", "Ignoring evidence that the plan is not working"],
    measure: ["Weeks with a written plan and a review", "Lagging results against target (see Scorecard)", "Number of decisions logged and later reviewed"],
    reading: [{ t: "The Art of War", by: "Sun Tzu" }, { t: "Good Strategy Bad Strategy", by: "Richard Rumelt" }, { t: "Thinking in Bets", by: "Annie Duke" }, { t: "Poor Charlie's Almanack", by: "Charles T. Munger" }],
    verse: { ref: "Proverbs 24:6", text: "For by wise counsel thou shalt make thy war: and in multitude of counsellors there is safety." },
    ruleNums: [3, 6, 15], rules: "Rules 3, 6, 15",
    links: [{ label: "Goals", href: "/goals" }, { label: "Weekly review", href: "/review" }],
  },
  {
    n: 5, key: "farmer", line: "A farmer's patience", title: "Patience", animal: "Polar bear",
    essence: "Planting today for a harvest you cannot yet see, and tending without complaint.",
    why: "Anything worth having runs on seasons. The farmer does not dig up the seed to check on it; he does the work that is his and trusts the process. Patience is not waiting around, it is faithful work with a long horizon.",
    principles: [
      { t: "Seedtime and harvest are different jobs", b: "There is a season to prepare soil, plant, tend, and reap. Judging in the planting season by harvest-season standards produces needless despair." },
      { t: "Compounding is invisible at first", b: "Improving 1 percent a day for a year multiplies to about 38 times; declining 1 percent a day shrinks you to about 3 percent. Early results look tiny, which is why most people quit just before the curve bends (James Clear calls this the plateau of latent potential)." },
      { t: "Soil before seed", b: "Sleep, health, money basics and relationships are soil. Neglect them and nothing you plant will thrive." },
      { t: "Tend daily, judge quarterly", b: "Do the small chores every day. Review progress every 90 days, not every 90 minutes. Constant checking breeds anxiety, not growth." },
      { t: "Weed ruthlessly", b: "Patience does not mean accepting everything. Remove what chokes the crop: time sinks, harmful people, habits that steal energy." },
      { t: "Process goals over outcome goals", b: "You control the sowing and the watering, not the rain. Commit to inputs ('4 sessions, 5 deep blocks') and let outcomes follow." },
      { t: "Keep a harvest log", b: "Record small wins and signs of growth each week. It is the evidence you will need on the days patience wears thin." },
    ],
    daily: ["Do today's one small chore on the long project, however small", "Resist checking results; log the input instead", "Say 'not yet' instead of 'it is not working'"],
    weekly: ["Write three signs of growth, however small", "Weed out one time sink", "Read your harvest log aloud on Sunday"],
    minimum: "Did my long-game chore without checking for results",
    mistakes: ["Quitting in the plateau", "Switching projects at the first dip", "Measuring daily outcomes you cannot control", "Mistaking patience for passivity"],
    measure: ["Days you did the input, regardless of mood", "Harvest-log entries per week", "Quarterly milestone review done on time"],
    reading: [{ t: "Atomic Habits", by: "James Clear" }, { t: "The Compound Effect", by: "Darren Hardy" }, { t: "Mastery", by: "Robert Greene" }, { t: "Galatians 6 and James 5", by: "Scripture" }],
    verse: { ref: "Galatians 6:9", text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not." },
    ruleNums: [4, 13, 14], rules: "Rules 4, 13, 14",
    links: [{ label: "Progress", href: "/progress" }, { label: "Trends", href: "/trends" }],
  },
  {
    n: 6, key: "lion", line: "A lion's confidence", title: "Confidence", animal: "Lion",
    essence: "Quiet, earned certainty that you can face what is in front of you.",
    why: "Real confidence is not noise or posing; it is trust in yourself built from kept promises and survived challenges. Albert Bandura's research on self-efficacy shows that personal mastery experiences are the strongest source of it.",
    principles: [
      { t: "Confidence is evidence", b: "Bandura identified four sources: mastery experiences (strongest), watching people like you succeed, encouragement, and your physical state. Stack small wins deliberately; keep a win log." },
      { t: "Keep promises to yourself", b: "Every promise kept adds a deposit to the account of self-trust; every broken one is a withdrawal. Make fewer, smaller promises and keep them." },
      { t: "Courage is action despite fear", b: "The lion is not fearless; it acts decisively. Do one small frightening thing a day (speak first, ask, publish, make the call). Gradual exposure is the proven way fear shrinks." },
      { t: "Calm body, slow voice", b: "Stand tall, breathe low and slow, speak slower than feels natural. The big claims about 'power poses' changing hormones have not held up, but posture and pace still affect how you feel and are seen." },
      { t: "Prepare so you can relax", b: "Preparation is the most honest source of confidence. Do the reps beforehand and you will not need to bluff." },
      { t: "Roar rarely, rest well", b: "Lions are calm most of the day. Confident people are rarely loud; they do not need to prove anything. Pair confidence with humility and a willingness to learn." },
      { t: "Treat failure as data", b: "A confident person is not someone who never fails; it is someone who recovers quickly and learns. Write down what the miss taught you, then move." },
    ],
    daily: ["One small act of courage (speak first, ask, send, apply)", "Keep the one promise you made to yourself this morning", "Record one win in your win log before bed"],
    weekly: ["Climb one rung of your fear ladder", "Re-read the win log and look for patterns", "Stand and speak slowly in one conversation on purpose"],
    minimum: "Did one small thing that scared me and logged a win",
    mistakes: ["Faking confidence instead of earning it", "Confusing loudness with strength", "Avoiding everything that threatens the ego", "Comparing your day 30 to someone else's year 10"],
    measure: ["Courage acts per week", "Promises kept vs promises made", "Your own 1 to 5 confidence rating each Sunday"],
    reading: [{ t: "The Confidence Code", by: "Katty Kay and Claire Shipman" }, { t: "Feel the Fear and Do It Anyway", by: "Susan Jeffers" }, { t: "Mindset", by: "Carol Dweck" }],
    verse: { ref: "Proverbs 28:1", text: "The wicked flee when no man pursueth: but the righteous are bold as a lion." },
    ruleNums: [4, 5, 11], rules: "Rules 4, 5, 11",
    links: [{ label: "Quotes", href: "/quotes" }, { label: "Lessons", href: "/lessons" }],
  },
  {
    n: 7, key: "poet", line: "A poet's heart", title: "Heart", animal: "Orca",
    essence: "Feeling deeply, naming it well, and staying tender without being fragile.",
    why: "Discipline without heart turns hard and lonely. A poet notices beauty, names feelings precisely and loves openly. These skills improve relationships, resilience and judgement, and the research behind them is solid.",
    principles: [
      { t: "Name it to tame it", b: "Studies of 'affect labelling' (for example Lieberman and colleagues) find that putting a feeling into precise words reduces its emotional intensity. 'Anxious' is less useful than 'worried I will disappoint my manager'." },
      { t: "Write it out", b: "James Pennebaker's expressive writing studies found that 15 to 20 minutes of honest writing about a hard experience over a few days brings modest but consistent benefits to wellbeing. Write for yourself, uncensored." },
      { t: "Count your blessings", b: "Gratitude practices (Emmons and McCullough) are linked to higher wellbeing. Write three specific things, with why they happened, not generic lists." },
      { t: "Make room for awe", b: "Psychologist Dacher Keltner finds that awe (nature, music, great acts of others) makes people more humble and generous. Walk somewhere beautiful, look at the sky, read a Psalm aloud." },
      { t: "Listen to understand", b: "Empathy is a skill. Repeat back what you heard, ask one more question, hold your advice until asked." },
      { t: "Guard the heart", b: "Choose what you feed it: the music, feeds, people and stories you take in shape your inner life. Remove cheap outrage and envy sources." },
      { t: "Let strength be gentle", b: "Tenderness and strength are partners, not opposites. Apologise quickly, say thank you specifically, tell people you love them." },
    ],
    daily: ["Write three lines: one thing I felt (exact word), one thing I noticed that was beautiful, one thing I am grateful for", "Read a Psalm, a poem or a page of good writing", "One sincere, specific message to someone"],
    weekly: ["One 15-minute honest writing session", "One conversation where you only listen", "Time outdoors or in music with no phone"],
    minimum: "Wrote three lines (felt, noticed, grateful)",
    mistakes: ["Calling every feeling 'stressed'", "Using sentiment as a replacement for action", "Bottling things up until they erupt", "Letting social media decide your emotions"],
    measure: ["Days with a journal or gratitude entry", "Meaningful messages sent per week", "Your Sunday 1 to 5 rating of 'felt connected and present'"],
    reading: [{ t: "The Book of Psalms", by: "Scripture" }, { t: "Letters to a Young Poet", by: "Rainer Maria Rilke" }, { t: "Atlas of the Heart", by: "Brené Brown" }, { t: "Devotions", by: "Mary Oliver" }],
    verse: { ref: "Proverbs 4:23", text: "Keep thy heart with all diligence; for out of it are the issues of life." },
    ruleNums: [2, 14], rules: "Rules 2, 14",
    links: [{ label: "Journal", href: "/journal" }, { label: "Gratitude", href: "/gratitude" }],
  },
  {
    n: 8, key: "monk", line: "A monk's concentration", title: "Focus", animal: "Crocodile and eagle",
    essence: "One thing at a time, fully, in a world built to shatter attention.",
    why: "Attention is the raw material of every skill and relationship. Monastic traditions built whole lives around protecting it. Deep, undistracted work is also rare, so it is valuable.",
    principles: [
      { t: "Single-task", b: "Switching tasks leaves 'attention residue' (Sophie Leroy's research): part of your mind stays on the last task. Finish or park cleanly before switching." },
      { t: "Schedule deep work", b: "Cal Newport's Deep Work suggests protected blocks of 60 to 90 minutes with a fixed ritual: same place, same start cue, phone out of the room, defined output. Two blocks a day is plenty for most people." },
      { t: "Remove the phone", b: "Some studies find that even a silent phone on the desk reduces available attention. Put it in another room or on do-not-disturb during blocks, and use app limits for social feeds." },
      { t: "Train attention directly", b: "Ten minutes of breath-focus meditation (return to the breath each time you drift) is basic attention training. Mindfulness practice shows modest but real benefits for attention and stress in studies." },
      { t: "Keep a rhythm", b: "Benedictine monks organise the day around fixed hours of prayer and work (ora et labora). A repeated structure removes decision fatigue and makes depth normal." },
      { t: "Embrace silence and solitude", b: "Regular time alone with your thoughts, without audio or screens, builds judgement and creativity. Walks without headphones count." },
      { t: "Shut down on purpose", b: "End the workday with a ritual: write tomorrow's top three, close tabs, say 'shutdown complete'. Rest then really is rest." },
      { t: "Fast from noise", b: "A weekly digital sabbath, or one social-free day, resets cravings and shows how much time the feeds were taking." },
    ],
    daily: ["Two focused blocks (60 to 90 min) on your top goal, phone in another room", "10 minutes of stillness: breath, silence or prayer", "Social media only at set times, under 30 minutes (rule 1)", "Shutdown ritual at the end of work"],
    weekly: ["Count deep-work blocks (see the scorecard)", "One digital sabbath hour or half-day", "Audit the three biggest attention thieves"],
    minimum: "One deep-work block and 10 minutes of stillness",
    mistakes: ["Multitasking and calling it productivity", "Starting blocks with email", "Keeping the phone visible", "Treating meditation as another achievement to grade"],
    measure: ["Deep-work blocks per week", "Social-app minutes per day", "Quality of the output of each block (yes or no)"],
    reading: [{ t: "Deep Work", by: "Cal Newport" }, { t: "Digital Minimalism", by: "Cal Newport" }, { t: "The Rule of St. Benedict", by: "Benedict of Nursia" }, { t: "Stolen Focus", by: "Johann Hari" }],
    verse: { ref: "Psalm 46:10", text: "Be still, and know that I am God." },
    ruleNums: [1, 6, 10], rules: "Rules 1, 6, 10",
    links: [{ label: "Check-in", href: "/checkin" }, { label: "Systems", href: "/systems" }],
  },
  {
    n: 9, key: "legend", line: "A legend's aura", title: "Presence", animal: "Lion and elephant",
    essence: "The quiet weight of someone whose word, work and character can be trusted.",
    why: "Aura is not a trick; it is the visible sum of the other pillars. People sense reliability, calm and goodwill within minutes. A legendary reputation is built by thousands of small kept commitments, usually when no one is watching.",
    principles: [
      { t: "Integrity first", b: "Say what you will do and do it, especially in small things. A name that people can trust is worth more than talent (Proverbs 22:1)." },
      { t: "Be fully present", b: "Phone away, eyes up, listen without rehearsing your answer. Dale Carnegie's classic advice holds: be genuinely interested in people, remember names, ask about them." },
      { t: "Calm under pressure", b: "When others rush, slow down. Steady breathing, lower voice, short sentences. Composure is magnetic and is trained in the Stoic and athlete pillars." },
      { t: "Give credit, take blame", b: "Leaders who credit others publicly and own mistakes quickly build deep loyalty (Willink's extreme ownership again)." },
      { t: "Raise your standards visibly", b: "Be on time, prepared and well presented. Standards in small things signal standards in large ones." },
      { t: "Be generous", b: "Share knowledge, introduce people, help without scorekeeping. Generosity compounds like trust does." },
      { t: "Live for the eulogy", b: "David Brooks distinguishes résumé virtues (skills and achievements) from eulogy virtues (kindness, honesty, faithfulness). Ask what you want said at your funeral and let it set your priorities." },
      { t: "Say less, mean more", b: "People with presence use fewer words and make them count. Silence and a well-timed question carry weight." },
    ],
    daily: ["Keep every small promise (or renegotiate it early)", "Give one person your full, phone-free attention", "Give credit to someone by name", "Arrive early and prepared once today"],
    weekly: ["Ask one person for honest feedback on how you come across", "Do one anonymous kindness", "Review: where did I fall short of my own word this week?"],
    minimum: "Kept my small promises and gave someone my full attention",
    mistakes: ["Performing presence instead of building it", "Needing to be the loudest voice", "Name-dropping or self-promotion", "Over-promising and under-delivering"],
    measure: ["Promises kept this week", "Times you arrived early or prepared", "Feedback received from trusted people"],
    reading: [{ t: "How to Win Friends and Influence People", by: "Dale Carnegie" }, { t: "The Road to Character", by: "David Brooks" }, { t: "Man's Search for Meaning", by: "Viktor Frankl" }],
    verse: { ref: "Proverbs 22:1", text: "A good name is rather to be chosen than great riches, and loving favour rather than silver and gold." },
    ruleNums: [2, 12, 14], rules: "Rules 2, 12, 14",
    links: [{ label: "Realities", href: "/realities" }, { label: "Review", href: "/review" }],
  },
  {
    n: 10, key: "wisdom", line: "God's wisdom", title: "Wisdom", animal: "Elephant (the matriarch)",
    essence: "Seeing life from above, receiving what you cannot work out alone, and letting God govern the other nine.",
    why: "Strength, discipline and strategy can build a powerful person who still goes the wrong way. Scripture puts the fear of the Lord at the start of wisdom and promises wisdom to those who ask. This pillar is the capstone and the steering wheel.",
    principles: [
      { t: "Start with reverence", b: "'The fear of the LORD is the beginning of wisdom' (Proverbs 9:10). Humility before God corrects pride at the root and makes every other pillar serve something bigger than ego." },
      { t: "Ask for wisdom", b: "James 1:5 promises that anyone who lacks wisdom may ask God, who gives generously. Solomon's request for an understanding heart (1 Kings 3) is the model. Ask specifically, before decisions, not after." },
      { t: "Read Proverbs daily", b: "One chapter a day (day of the month) is a time-tested rhythm. Underline what to do, not just what to know, and write one application." },
      { t: "Seek counsel", b: "Proverbs 15:22 says purposes are established by many counsellors. Keep a few wise, honest, older voices and consult them before big moves." },
      { t: "Trust and obey", b: "Proverbs 3:5-6 pairs trusting God with all your heart and acknowledging him in all your ways. Wisdom is proved by obedience to what you already know." },
      { t: "Honour the Sabbath", b: "A weekly day of rest declares that you are not the one holding the world together. It also protects your body and heart." },
      { t: "Pray, then work", b: "Prayer is not a substitute for effort or planning, but it sets the direction and quiets anxiety. Pray at the start of the day and at decisions." },
      { t: "Hold control loosely", b: "The Stoic division between what is and is not up to you fits a Christian reading: do your part with all your strength and entrust the rest to God." },
    ],
    daily: ["Morning prayer for wisdom and direction", "Read one Proverbs chapter and write one application", "Evening: thank God for three things and confess one failure", "Before any big decision: pray and ask a counsellor"],
    weekly: ["One Sabbath block of real rest and worship", "Talk with a mentor or elder about a decision", "Review answered prayers and lessons learned"],
    minimum: "Prayed and read today's Proverbs chapter",
    mistakes: ["Treating prayer as a last resort", "Collecting knowledge without obeying", "Seeking only advice that agrees with you", "Working seven days a week and calling it devotion"],
    measure: ["Days praying and reading", "Decisions taken with counsel", "Sabbaths kept in the month"],
    reading: [{ t: "Proverbs, Ecclesiastes and James", by: "Scripture" }, { t: "Mere Christianity", by: "C. S. Lewis" }, { t: "The Imitation of Christ", by: "Thomas à Kempis" }],
    verse: { ref: "James 1:5", text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." },
    ruleNums: [3, 5, 15], rules: "Rules 3, 5, 15",
    links: [{ label: "Bible", href: "/bible" }, { label: "Proverbs tab", href: "/challenge?tab=proverbs" }],
  },
];

/** The ten fit together in five pairs. */
export const ARC: { pair: string; pillars: number[]; body: string }[] = [
  { pair: "Foundation", pillars: [1, 2], body: "Body and mind are the machine and its operator. No amount of strategy survives a broken body or a panicked mind." },
  { pair: "Will", pillars: [3, 4], body: "Discipline is the engine, vision is the map. Discipline without vision is wasted effort; vision without discipline is a daydream." },
  { pair: "Time and fire", pillars: [5, 6], body: "Patience carries you through the seasons, confidence carries you into the fight. One without the other makes you either passive or reckless." },
  { pair: "Inner life", pillars: [7, 8], body: "Heart gives the work meaning; focus gives it depth. Together they stop achievement from turning cold or scattered." },
  { pair: "Crown", pillars: [9, 10], body: "Presence is what others see; wisdom is what steers it. Wisdom keeps influence from turning into pride." },
];

/** When each pillar fits best in a day. */
export const DAY_FLOW: { time: string; items: { p: number; what: string }[] }[] = [
  { time: "Morning", items: [{ p: 10, what: "Pray and read your Proverbs chapter" }, { p: 2, what: "Premeditate the day (3 minutes)" }, { p: 1, what: "Train or walk" }, { p: 3, what: "Make the bed, do the hard thing first" }] },
  { time: "Midday", items: [{ p: 8, what: "Two deep-work blocks, phone away" }, { p: 4, what: "Work the one decisive task" }, { p: 6, what: "One small act of courage" }] },
  { time: "Afternoon", items: [{ p: 9, what: "Be fully present with people, keep promises" }, { p: 5, what: "Do the long-game chore, no checking" }] },
  { time: "Evening", items: [{ p: 7, what: "Three lines: felt, noticed, grateful" }, { p: 3, what: "After-action review" }, { p: 2, what: "Stoic evening review" }, { p: 10, what: "Thank God, confess one failure" }, { p: 1, what: "Lights out on time" }] },
];

/** The 10-minute minimum, for days when everything is going wrong. */
export const FLOOR: string[] = [
  "Pray for wisdom and read one verse (1 minute)",
  "Name the one thing within your control today (1 minute)",
  "Do 20 push-ups or a 5-minute walk (5 minutes)",
  "Write the single most important task and start it (2 minutes)",
  "Write one line of gratitude (1 minute)",
];

export function pillarForDay(dayISO: string): Pillar {
  const days = Math.floor(Date.parse(dayISO + "T00:00:00Z") / 86400000);
  return PILLARS[((days % PILLARS.length) + PILLARS.length) % PILLARS.length];
}
