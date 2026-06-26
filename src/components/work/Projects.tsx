import { Column, Text } from "@once-ui-system/core";
import { ProjectCard } from "@/components";
import { supabase } from "@/lib/supabase";
import { Project as DBProject } from "@/types/database.types";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
}

export async function Projects({ range, exclude }: ProjectsProps) {
  let dbProjects: DBProject[] = [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      dbProjects = data;
    }
  } catch (err) {
    console.error("Failed to fetch projects from Supabase:", err);
  }

  let filtered = dbProjects;
  if (exclude && exclude.length > 0) {
    filtered = dbProjects.filter((p) => {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return !exclude.includes(p.id) && !exclude.includes(slug);
    });
  }

  const displayed = range
    ? filtered.slice(range[0] - 1, range[1] ?? filtered.length)
    : filtered;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayed.map((project, index) => {
        const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <ProjectCard
            priority={index < 2}
            key={project.id}
            href={project.live_url || `/projects/${slug}`}
            images={project.image_url ? [project.image_url] : []}
            title={project.title}
            description={project.description}
            content=""
            avatars={[]}
            link={project.github_url || project.live_url || ""}
          />
        );
      })}
    </Column>
  );
}
