import { ArrowRight, BadgeCheck, BookOpenText, HandHeart, HeartHandshake, MapPin, Radio, Sparkles } from "lucide-react";
import Link from "next/link";

const stories = [
  {
    title: "A classroom restocked in Tamale",
    location: "Tamale, Northern Region",
    category: "Education",
    summary: "Girls received books, uniforms, and learning kits after community donors completed the school supplies campaign.",
    result: "120 students supported",
    moment: "Students opened their first new textbooks together during morning assembly.",
    source: "Featured in Ghana Education News",
    trending: true
  },
  {
    title: "Emergency support after Volta flooding",
    location: "South Tongu, Volta Region",
    category: "Emergency",
    summary: "Families received food, blankets, medication, and temporary shelter while local volunteers shared progress updates.",
    result: "64 families reached",
    moment: "Families moved into temporary shelters with food packs already waiting.",
    source: "Trending on Ghana Relief Forum",
    trending: true
  },
  {
    title: "Hospital bills cleared for urgent care",
    location: "Accra, Greater Accra",
    category: "Medical",
    summary: "A verified medical campaign helped cover treatment costs, receipts, and follow-up support for the beneficiary.",
    result: "GH₵31,850 raised",
    moment: "The family received a cleared bill and a follow-up care plan.",
    source: "Shared on Health Campaign Updates",
    trending: false
  },
  {
    title: "Community health outreach in Kumasi",
    location: "Kumasi, Ashanti Region",
    category: "Health",
    summary: "Free health screening and medication distribution reached over 200 community members through local clinic partnerships.",
    result: "200+ people screened",
    moment: "Elders left the clinic with medication, checks completed, and next steps written down.",
    source: "Featured in Ghana Health News",
    trending: true
  },
  {
    title: "Clean water project completed in Bolgatanga",
    location: "Bolgatanga, Upper East Region",
    category: "Infrastructure",
    summary: "New borehole and water purification system installed, providing clean drinking water to 500+ villagers.",
    result: "500+ villagers impacted",
    moment: "Children filled clean water containers before school without walking the old route.",
    source: "Trending on Community Development Forum",
    trending: true
  },
  {
    title: "Youth skills training program launched",
    location: "Cape Coast, Central Region",
    category: "Education",
    summary: "Vocational training in carpentry, tailoring, and ICT skills launched for 80 unemployed youth in the community.",
    result: "80 youth enrolled",
    moment: "Each trainee received a starter toolkit and met their local mentor.",
    source: "Featured in Youth Empowerment News",
    trending: false
  }
];

export default function StoriesPage() {
  return (
    <>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-12 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#edf7ee] px-3 py-1 text-sm font-black text-boame-deep">
            <HeartHandshake size={16} />
            Community outcomes
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-boame-ink sm:text-6xl lg:text-7xl">
            Impact stories from verified giving
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Follow how donations, item pledges, and group support turn into real help for Ghanaian families, schools, hospitals, and communities.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-700">
            <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-boame-deep" /> Verified outcomes</span>
            <span className="inline-flex items-center gap-2"><Radio size={17} className="text-boame-deep" /> Campaign updates</span>
            <span className="inline-flex items-center gap-2"><HeartHandshake size={17} className="text-boame-deep" /> Local support</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-wide text-boame-deep">Published after verification</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-boame-ink">What was raised, delivered, and changed</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">Each story is shaped from verified campaign updates, delivery notes, receipts, and community reports.</p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-boame-soft text-boame-deep">
                  <BookOpenText size={19} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-boame-ink">Story notes</h3>
                  <p className="text-xs font-semibold text-gray-500">Verified outcomes, told with context and care.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Raised", "Delivered", "Confirmed", "Followed up"].map((item) => (
                <span key={item} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-black text-gray-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Evidence checked", "Photos, receipts, and beneficiary updates reviewed."],
              ["People centered", "Stories focus on what changed for families and communities."],
              ["Still traceable", "Readers can return to campaigns and see the giving flow."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-black text-boame-ink">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#edf7ee] px-3 py-1 text-xs font-black text-boame-deep">{story.category}</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-gray-500">
                  <BadgeCheck size={14} className="text-boame-deep" /> Verified
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black leading-tight text-boame-ink">{story.title}</h2>
              <p className="mt-3 flex items-center gap-1 text-sm font-bold text-gray-500">
                <MapPin size={15} /> {story.location}
              </p>
              <p className="mt-4 leading-7 text-gray-600">{story.summary}</p>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-boame-deep">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-gray-500">Human moment</p>
                    <p className="mt-1 text-sm leading-6 text-boame-ink">{story.moment}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
                <Radio size={12} />
                <span>{story.source}</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="inline-flex items-center gap-2 font-black text-boame-deep">
                  <HandHeart size={17} />
                  {story.result}
                </span>
                <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm font-black text-boame-deep">
                  Campaigns <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
