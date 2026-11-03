import { db } from "@/db";
import { lifeLessons, LESSON_CATEGORIES } from "@/db/schema-lessons";
import { requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { RESILIENCE_STORIES, STORY_FIELDS, getStoryOfTheDay, type ResilienceStory } from "@/db/seed-data/resilience";
import { photoUrl, storyPhoto } from "@/lib/images";
import { addLesson, deleteLesson, saveStoryLesson } from "./actions";
import { BookmarkPlus, Flame, History, Lightbulb, Mountain, NotebookPen, Sparkles, Sunrise, Target } from "lucide-react";

type Lesson = typeof lifeLessons.$inferSelect;

const catLabel = (key: string) => LESSON_CATEGORIES.find((c) => c.key === key)?.label ?? key;
const fieldLabel = (key: string) => STORY_FIELDS.find((f) => f.key === key)?.label ?? key;

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function monthKey(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function lessonStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  let day = set.has(today) ? today : addDaysISO(today, -1);
  let n = 0;
  while (set.has(day)) {
    n += 1;
    day = addDaysISO(day, -1);
  }
  return n;
}

function StoryBlock({ label, children, accent }: { label: string; children: React.ReactNode; accent: string }) {
  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${accent}`}>{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-300">{children}</p>
    </div>
  );
}

function SaveStoryButton({ story, small }: { story: ResilienceStory; small?: boolean }) {
  return (
    <form action={saveStoryLesson}>
      <input type="hidden" name="storyId" value={story.id} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition ${
          small
            ? "border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 hover:bg-neutral-800"
            : "bg-amber-500 px-3 py-1.5 text-xs text-neutral-950 hover:bg-amber-400"
        }`}
      >
        <BookmarkPlus size={13} /> Save to my lessons
      </button>
    </form>
  );
}

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; field?: string }>;
}) {
  const user = await requireUser();
  const { cat, field } = await searchParams;
  const today = todayISO();
  const story = getStoryOfTheDay(today);

  let rows: Lesson[] = [];
  let tableMissing = false;
  try {
    rows = await db
      .select()
      .from(lifeLessons)
      .where(eq(lifeLessons.userId, user.id))
      .orderBy(desc(lifeLessons.learnedOn), desc(lifeLessons.createdAt));
  } catch {
    tableMissing = true;
  }

  const visible = cat ? rows.filter((r) => r.category === cat) : rows;
  const streak = lessonStreak(rows.map((r) => r.learnedOn), today);
  const thisMonth = rows.filter((r) => r.learnedOn.slice(0, 7) === today.slice(0, 7)).length;

  // Resurface an older lesson (30+ days old), rotating daily.
  const older = rows.filter((r) => r.learnedOn <= addDaysISO(today, -30));
  const dayNum = Math.floor(new Date(today + "T00:00:00Z").getTime() / 86_400_000);
  const resurfaced = older.length ? older[dayNum % older.length] : null;

  const groups = new Map<string, Lesson[]>();
  for (const r of visible) {
    const k = monthKey(r.learnedOn);
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }

  const library = field ? RESILIENCE_STORIES.filter((s) => s.field === field) : RESILIENCE_STORIES;

  return (
    <div>
      <PageHeader
        image={photoUrl("lessons")}
        eyebrow="Lessons of Life"
        title="What life is teaching you"
        subtitle="Write down one lesson a day. Learn from the greats who fell down and got back up."
        action={
          <div className="flex gap-5 text-right">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Lessons</p>
              <p className="text-xl font-semibold text-white">{rows.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Streak</p>
              <p className="flex items-center justify-end gap-1 text-xl font-semibold text-white">
                <Flame size={16} className="text-orange-400" />
                {streak}
              </p>
            </div>
          </div>
        }
      />

      {tableMissing && (
        <Card className="mb-6 border-amber-800/60 bg-amber-950/20">
          <p className="text-sm font-medium text-amber-200">One-time setup needed</p>
          <p className="mt-1 text-sm text-neutral-300">
            The lessons table doesn&apos;t exist in your database yet. Run the SQL in{" "}
            <code className="rounded bg-neutral-800 px-1">drizzle/manual/life_lessons.sql</code> in the Neon SQL editor, then
            reload. The story library below works already.
          </p>
        </Card>
      )}

      {/* Story of the day */}
      <Card className="mb-8 overflow-hidden border-amber-900/50 p-0">
        <div className="relative h-44 sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={storyPhoto(story.field)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              <Sunrise size={14} /> Great life of the day · {fieldLabel(story.field)}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{story.name}</h2>
            <p className="text-sm text-neutral-300">{story.known}</p>
          </div>
        </div>
        <div className="grid gap-5 bg-gradient-to-b from-neutral-950 to-neutral-900/60 p-5 sm:p-7 md:grid-cols-3">
          <StoryBlock label="The setback" accent="text-rose-300">
            {story.setback}
          </StoryBlock>
          <StoryBlock label="How they kept going" accent="text-sky-300">
            {story.persistence}
          </StoryBlock>
          <StoryBlock label="The breakthrough" accent="text-emerald-300">
            {story.breakthrough}
          </StoryBlock>
        </div>
        <div className="border-t border-neutral-800 bg-neutral-950/60 p-5 sm:px-7">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
            <Lightbulb size={13} /> The lesson
          </p>
          <p className="mt-1.5 text-lg font-medium leading-snug text-neutral-50">{story.lesson}</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-neutral-300">
            <Target size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <span>
              <span className="font-medium text-neutral-100">Your move today:</span> {story.action}
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!tableMissing && <SaveStoryButton story={story} />}
            <Link
              href={`/journal?prompt=${encodeURIComponent(`${story.name}: ${story.lesson}`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              <NotebookPen size={13} /> Reflect in journal
            </Link>
          </div>
        </div>
      </Card>

      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* Log a lesson */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-1 flex items-center gap-2 font-semibold text-neutral-100">
              <Sparkles size={16} className="text-amber-300" /> Log today&apos;s lesson
            </h2>
            <p className="mb-4 text-xs text-neutral-500">
              {thisMonth} logged this month. One honest sentence is enough.
            </p>
            <form action={addLesson} className="space-y-3">
              <Textarea name="lesson" rows={3} placeholder="What did life teach you today?" required disabled={tableMissing} />
              <Textarea
                name="context"
                rows={2}
                placeholder="What happened? (optional — the story behind the lesson)"
                disabled={tableMissing}
              />
              <Input name="source" placeholder="Learned from… (a person, book, mistake, sermon)" disabled={tableMissing} />
              <div className="grid grid-cols-2 gap-3">
                <Select name="category" defaultValue="life" disabled={tableMissing}>
                  {LESSON_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Input type="date" name="learnedOn" defaultValue={today} disabled={tableMissing} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={tableMissing}>
                  Save lesson
                </Button>
              </div>
            </form>
          </Card>

          {resurfaced && (
            <Card className="border-violet-900/50 bg-violet-950/15">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                <History size={13} /> From your past · {fmtDate(resurfaced.learnedOn)}
              </p>
              <p className="mt-2 text-base font-medium leading-snug text-neutral-100">{resurfaced.lesson}</p>
              {resurfaced.context && <p className="mt-1.5 text-sm text-neutral-400">{resurfaced.context}</p>}
              <p className="mt-3 text-xs text-neutral-500">Are you still living this lesson?</p>
            </Card>
          )}
        </div>

        {/* My lessons */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-neutral-100">My lessons</h2>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={field ? `/lessons?field=${field}` : "/lessons"}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  !cat ? "border-amber-500 bg-amber-500/15 text-amber-200" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
                }`}
              >
                All
              </Link>
              {LESSON_CATEGORIES.filter((c) => rows.some((r) => r.category === c.key)).map((c) => (
                <Link
                  key={c.key}
                  href={`/lessons?cat=${c.key}${field ? `&field=${field}` : ""}`}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${
                    cat === c.key
                      ? "border-amber-500 bg-amber-500/15 text-amber-200"
                      : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <Card className="text-center">
              <p className="text-sm text-neutral-300">No lessons logged yet.</p>
              <p className="mt-1 text-xs text-neutral-500">
                Start with today&apos;s — or save the lesson from the great life of the day above.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {[...groups.entries()].map(([month, items]) => (
                <div key={month}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {month} · {items.length}
                  </p>
                  <div className="space-y-2.5">
                    {items.map((r) => (
                      <Card key={r.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium leading-snug text-neutral-100">{r.lesson}</p>
                          <form action={deleteLesson}>
                            <input type="hidden" name="id" value={r.id} />
                            <button type="submit" className="text-xs text-neutral-600 hover:text-red-400" aria-label="Delete lesson">
                              delete
                            </button>
                          </form>
                        </div>
                        {r.context && <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{r.context}</p>}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                          <span>{fmtDate(r.learnedOn)}</span>
                          <Badge>{catLabel(r.category)}</Badge>
                          {r.source && <span className="italic">— {r.source}</span>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Library of great lives */}
      <div id="library">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-neutral-50">
              <Mountain size={18} className="text-amber-300" /> Great lives that never gave up
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {RESILIENCE_STORIES.length} people who faced prison, poverty, rejection, illness and loss — and kept going.
            </p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Link
            href={`/lessons${cat ? `?cat=${cat}` : ""}#library`}
            className={`rounded-full border px-3 py-1 text-xs ${
              !field ? "border-amber-500 bg-amber-500/15 text-amber-200" : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
            }`}
          >
            All · {RESILIENCE_STORIES.length}
          </Link>
          {STORY_FIELDS.map((f) => (
            <Link
              key={f.key}
              href={`/lessons?field=${f.key}${cat ? `&cat=${cat}` : ""}#library`}
              className={`rounded-full border px-3 py-1 text-xs ${
                field === f.key
                  ? "border-amber-500 bg-amber-500/15 text-amber-200"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-800/60"
              }`}
            >
              {f.label} · {RESILIENCE_STORIES.filter((s) => s.field === f.key).length}
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {library.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-100">{s.name}</h3>
                  <p className="text-xs text-neutral-500">{s.known}</p>
                </div>
                <Badge className="shrink-0 border-amber-700/50 text-amber-200">{fieldLabel(s.field)}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                <span className="font-medium text-rose-300">Setback: </span>
                {s.setback}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer select-none text-xs font-medium text-amber-300 hover:text-amber-200">
                  How they rose
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  <span className="font-medium text-sky-300">Kept going: </span>
                  {s.persistence}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  <span className="font-medium text-emerald-300">Breakthrough: </span>
                  {s.breakthrough}
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  <span className="font-medium text-neutral-100">Try: </span>
                  {s.action}
                </p>
              </details>
              <div className="mt-auto pt-4">
                <p className="mb-3 border-l-2 border-amber-500/60 pl-3 text-sm font-medium leading-snug text-neutral-100">
                  {s.lesson}
                </p>
                {!tableMissing && <SaveStoryButton story={s} small />}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
