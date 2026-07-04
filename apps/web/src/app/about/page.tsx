export default function AboutPage() {
  return <InfoPage title="About BoaMe" text="BoaMe exists to make everyday giving transparent, local, and accessible across Ghana." />;
}

function InfoPage({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-gray-600">{text}</p>
    </section>
  );
}
