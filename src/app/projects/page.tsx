import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL, about, person, work } from "@/resources";
import { Projects } from "@/components/work/Projects";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: "Projects – " + person.name,
    description: "Design and dev projects by " + person.name,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent("Projects")}`,
    path: "/projects",
  });
}

export default function ProjectsPage() {
  return (
    <Column maxWidth="m" paddingTop="24">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path="/projects"
        title={"Projects – " + person.name}
        description={"Design and dev projects by " + person.name}
        image={`/api/og/generate?title=${encodeURIComponent("Projects")}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        Projects
      </Heading>
      <Projects />
    </Column>
  );
}
