import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <section className="bg-neutral text-neutral-content">
      <Container>
        <div className="grid gap-6 py-24">
          <Eyebrow tone="brand">Page not found</Eyebrow>
          <h1 className="font-serif text-h2 font-light sm:text-h1">
            This page has <em className="text-primary italic">moved on</em>
          </h1>
          <p className="max-w-[40ch] font-serif text-lead text-neutral-content/90">
            The page you’re looking for doesn’t exist. Try the season schedule or head back home.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/events">See the season</ButtonLink>
            <ButtonLink href="/" variant="outlineOnDark">
              Home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
