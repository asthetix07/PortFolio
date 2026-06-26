"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Column, Heading, Text, Input, Button, Row, Flex, Spinner } from "@once-ui-system/core";

type Tab = "blog" | "project" | "experience" | "skill" | "gallery";
type Status = "idle" | "saving" | "saved" | "error";

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("blog");

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState("");
  const [blogStatus, setBlogStatus] = useState<Status>("idle");
  const [blogErrorMessage, setBlogErrorMessage] = useState("");

  // Project Form State
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectLive, setProjectLive] = useState("");
  const [projectTags, setProjectTags] = useState("");
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState("");
  const [projectStatus, setProjectStatus] = useState<Status>("idle");
  const [projectErrorMessage, setProjectErrorMessage] = useState("");

  // Work Experience Form State
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expTimeframe, setExpTimeframe] = useState("");
  const [expAchievements, setExpAchievements] = useState("");
  const [expImageFile, setExpImageFile] = useState<File | null>(null);
  const [expImagePreview, setExpImagePreview] = useState("");
  const [expSortOrder, setExpSortOrder] = useState("0");
  const [expStatus, setExpStatus] = useState<Status>("idle");
  const [expErrorMessage, setExpErrorMessage] = useState("");

  // Technical Skill Form State
  const [skillTitle, setSkillTitle] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillTags, setSkillTags] = useState("");
  const [skillImageFile, setSkillImageFile] = useState<File | null>(null);
  const [skillImagePreview, setSkillImagePreview] = useState("");
  const [skillSortOrder, setSkillSortOrder] = useState("0");
  const [skillStatus, setSkillStatus] = useState<Status>("idle");
  const [skillErrorMessage, setSkillErrorMessage] = useState("");

  // Gallery Form State
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState("");
  const [galleryAlt, setGalleryAlt] = useState("");
  const [galleryOrientation, setGalleryOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [galleryStatus, setGalleryStatus] = useState<Status>("idle");
  const [galleryErrorMessage, setGalleryErrorMessage] = useState("");

  // Auth Guard — validates httpOnly cookie via server
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/admin-verify");
        if (res.ok) {
          setAuthorized(true);
        } else {
          router.push("/admin");
        }
      } catch {
        router.push("/admin");
      }
    }
    verifyAuth();
  }, [router]);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function parseTags(raw: string): string[] {
    return raw
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  function parseAchievements(raw: string): string[] {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File) => void,
    setPreview: (url: string) => void
  ) {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  // Blog Publish
  async function handlePublishBlog(e: React.FormEvent) {
    e.preventDefault();
    setBlogStatus("saving");
    setBlogErrorMessage("");

    try {
      let coverUrl = "";
      if (blogImageFile) {
        coverUrl = await uploadToCloudinary(blogImageFile);
      }

      const { error } = await supabase.from("blogs").insert({
        title: blogTitle,
        slug: generateSlug(blogTitle),
        description: blogDescription,
        content: blogContent,
        cover_url: coverUrl || null,
        published: true,
      });

      if (error) throw error;

      setBlogStatus("saved");
      setBlogTitle("");
      setBlogDescription("");
      setBlogContent("");
      setBlogImageFile(null);
      setBlogImagePreview("");

      setTimeout(() => setBlogStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setBlogStatus("error");
      setBlogErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  // Project Publish
  async function handlePublishProject(e: React.FormEvent) {
    e.preventDefault();
    setProjectStatus("saving");
    setProjectErrorMessage("");

    try {
      let imageUrl = "";
      if (projectImageFile) {
        imageUrl = await uploadToCloudinary(projectImageFile);
      }

      const { error } = await supabase.from("projects").insert({
        title: projectTitle,
        description: projectDescription,
        image_url: imageUrl || null,
        github_url: projectGithub || null,
        live_url: projectLive || null,
        tags: parseTags(projectTags),
      });

      if (error) throw error;

      setProjectStatus("saved");
      setProjectTitle("");
      setProjectDescription("");
      setProjectGithub("");
      setProjectLive("");
      setProjectTags("");
      setProjectImageFile(null);
      setProjectImagePreview("");

      setTimeout(() => setProjectStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setProjectStatus("error");
      setProjectErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  // Work Experience Publish
  async function handlePublishExperience(e: React.FormEvent) {
    e.preventDefault();
    setExpStatus("saving");
    setExpErrorMessage("");

    try {
      let imageUrl = "";
      if (expImageFile) {
        imageUrl = await uploadToCloudinary(expImageFile);
      }

      const { error } = await supabase.from("work_experiences").insert({
        company: expCompany,
        role: expRole,
        timeframe: expTimeframe,
        achievements: parseAchievements(expAchievements),
        image_url: imageUrl || null,
        sort_order: parseInt(expSortOrder) || 0,
      });

      if (error) throw error;

      setExpStatus("saved");
      setExpCompany("");
      setExpRole("");
      setExpTimeframe("");
      setExpAchievements("");
      setExpImageFile(null);
      setExpImagePreview("");
      setExpSortOrder("0");

      setTimeout(() => setExpStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setExpStatus("error");
      setExpErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  // Technical Skill Publish
  async function handlePublishSkill(e: React.FormEvent) {
    e.preventDefault();
    setSkillStatus("saving");
    setSkillErrorMessage("");

    try {
      let imageUrl = "";
      if (skillImageFile) {
        imageUrl = await uploadToCloudinary(skillImageFile);
      }

      const { error } = await supabase.from("technical_skills").insert({
        title: skillTitle,
        description: skillDescription || null,
        tags: parseTags(skillTags),
        image_url: imageUrl || null,
        sort_order: parseInt(skillSortOrder) || 0,
      });

      if (error) throw error;

      setSkillStatus("saved");
      setSkillTitle("");
      setSkillDescription("");
      setSkillTags("");
      setSkillImageFile(null);
      setSkillImagePreview("");
      setSkillSortOrder("0");

      setTimeout(() => setSkillStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setSkillStatus("error");
      setSkillErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  // Gallery Publish
  async function handlePublishGallery(e: React.FormEvent) {
    e.preventDefault();
    setGalleryStatus("saving");
    setGalleryErrorMessage("");

    try {
      if (!galleryImageFile) {
        throw new Error("Please select an image file.");
      }

      const imageUrl = await uploadToCloudinary(galleryImageFile);

      const { error } = await supabase.from("gallery").insert({
        src: imageUrl,
        alt: galleryAlt,
        orientation: galleryOrientation,
      });

      if (error) throw error;

      setGalleryStatus("saved");
      setGalleryAlt("");
      setGalleryImageFile(null);
      setGalleryImagePreview("");
      setGalleryOrientation("horizontal");

      setTimeout(() => setGalleryStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setGalleryStatus("error");
      setGalleryErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin");
  }

  if (!authorized) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Column fillWidth maxWidth="m" padding="xl" gap="l">
      {/* Page Header */}
      <Row fillWidth horizontal="between" vertical="center" marginBottom="m">
        <Heading variant="heading-strong-xl">Admin Dashboard</Heading>
        <Button onClick={handleLogout} variant="secondary" size="s">
          Logout
        </Button>
      </Row>

      {/* Tabs Switcher */}
      <Row gap="8" borderBottom="neutral-alpha-weak" paddingBottom="m" marginBottom="m" wrap>
        <Button
          onClick={() => setActiveTab("blog")}
          variant={activeTab === "blog" ? "primary" : "secondary"}
          size="m"
        >
          📝 New Blog Post
        </Button>
        <Button
          onClick={() => setActiveTab("project")}
          variant={activeTab === "project" ? "primary" : "secondary"}
          size="m"
        >
          🚀 New Project
        </Button>
        <Button
          onClick={() => setActiveTab("experience")}
          variant={activeTab === "experience" ? "primary" : "secondary"}
          size="m"
        >
          💼 Work Experience
        </Button>
        <Button
          onClick={() => setActiveTab("skill")}
          variant={activeTab === "skill" ? "primary" : "secondary"}
          size="m"
        >
          🛠️ Technical Skill
        </Button>
        <Button
          onClick={() => setActiveTab("gallery")}
          variant={activeTab === "gallery" ? "primary" : "secondary"}
          size="m"
        >
          🖼️ Gallery Image
        </Button>
      </Row>

      {/* Blog Post Form */}
      {activeTab === "blog" && (
        <Column
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="xl"
          fillWidth
          gap="m"
          shadow="l"
        >
          <Heading variant="heading-strong-m" marginBottom="s">
            New Blog Post
          </Heading>

          <form onSubmit={handlePublishBlog} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="custom-form-group">
              <label className="custom-label" htmlFor="blog-title">Blog Title</label>
              <Input
                id="blog-title"
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
                placeholder="e.g. How I Built My Portfolio"
              />
              {blogTitle && (
                <Text variant="body-default-xs" onBackground="neutral-weak" marginTop="4">
                  Generated URL Slug: /blog/<strong>{generateSlug(blogTitle)}</strong>
                </Text>
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="blog-desc">Short Description</label>
              <Input
                id="blog-desc"
                type="text"
                value={blogDescription}
                onChange={(e) => setBlogDescription(e.target.value)}
                required
                placeholder="One sentence shown on the blog card"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="blog-image">Cover Image</label>
              <input
                id="blog-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, setBlogImageFile, setBlogImagePreview)}
                className="custom-file-input"
              />
              {blogImagePreview && (
                <img
                  src={blogImagePreview}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-m)",
                    border: "1px solid var(--neutral-border-weak)",
                  }}
                />
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="blog-content">Blog Content (Markdown)</label>
              <textarea
                id="blog-content"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                required
                placeholder="Write your full blog post content here (supports Markdown)..."
                className="custom-textarea"
                rows={12}
              />
            </div>

            <Button type="submit" disabled={blogStatus === "saving"} fillWidth size="m">
              {blogStatus === "saving" ? "Publishing..." : "Publish Blog Post"}
            </Button>

            {blogStatus === "saved" && (
              <Text variant="body-default-s" style={{ color: "var(--brand-on-background-medium)" }} align="center">
                ✓ Blog post published successfully!
              </Text>
            )}
            {blogStatus === "error" && (
              <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
                Error: {blogErrorMessage || "Failed to publish blog post."}
              </Text>
            )}
          </form>
        </Column>
      )}

      {/* Project Form */}
      {activeTab === "project" && (
        <Column
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="xl"
          fillWidth
          gap="m"
          shadow="l"
        >
          <Heading variant="heading-strong-m" marginBottom="s">
            New Project
          </Heading>

          <form onSubmit={handlePublishProject} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-title">Project Title</label>
              <Input
                id="proj-title"
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                placeholder="e.g. My Portfolio Website"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-desc">Description</label>
              <textarea
                id="proj-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
                placeholder="What does this project do? What technologies were used?"
                className="custom-textarea"
                rows={4}
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-image">Project Screenshot</label>
              <input
                id="proj-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, setProjectImageFile, setProjectImagePreview)}
                className="custom-file-input"
              />
              {projectImagePreview && (
                <img
                  src={projectImagePreview}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-m)",
                    border: "1px solid var(--neutral-border-weak)",
                  }}
                />
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-tags">Tech Tags (comma separated)</label>
              <Input
                id="proj-tags"
                type="text"
                value={projectTags}
                onChange={(e) => setProjectTags(e.target.value)}
                placeholder="React, TypeScript, Supabase, Cloudinary"
              />
              {projectTags && (
                <Row gap="8" wrap marginTop="8">
                  {parseTags(projectTags).map((tag) => (
                    <Text
                      key={tag}
                      variant="body-default-xs"
                      style={{
                        backgroundColor: "var(--neutral-alpha-weak)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-s)",
                        border: "1px solid var(--neutral-border-weak)",
                      }}
                    >
                      {tag}
                    </Text>
                  ))}
                </Row>
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-github">GitHub URL (optional)</label>
              <Input
                id="proj-github"
                type="url"
                value={projectGithub}
                onChange={(e) => setProjectGithub(e.target.value)}
                placeholder="https://github.com/you/project"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="proj-live">Live URL (optional)</label>
              <Input
                id="proj-live"
                type="url"
                value={projectLive}
                onChange={(e) => setProjectLive(e.target.value)}
                placeholder="https://myproject.vercel.app"
              />
            </div>

            <Button type="submit" disabled={projectStatus === "saving"} fillWidth size="m">
              {projectStatus === "saving" ? "Saving..." : "Add Project"}
            </Button>

            {projectStatus === "saved" && (
              <Text variant="body-default-s" style={{ color: "var(--brand-on-background-medium)" }} align="center">
                ✓ Project added successfully!
              </Text>
            )}
            {projectStatus === "error" && (
              <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
                Error: {projectErrorMessage || "Failed to add project."}
              </Text>
            )}
          </form>
        </Column>
      )}

      {/* Work Experience Form */}
      {activeTab === "experience" && (
        <Column
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="xl"
          fillWidth
          gap="m"
          shadow="l"
        >
          <Heading variant="heading-strong-m" marginBottom="s">
            Add Work Experience
          </Heading>

          <form onSubmit={handlePublishExperience} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-company">Company Name</label>
              <Input
                id="exp-company"
                type="text"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                required
                placeholder="e.g. Google, Microsoft, Startup Inc."
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-role">Role / Job Title</label>
              <Input
                id="exp-role"
                type="text"
                value={expRole}
                onChange={(e) => setExpRole(e.target.value)}
                required
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-timeframe">Timeframe</label>
              <Input
                id="exp-timeframe"
                type="text"
                value={expTimeframe}
                onChange={(e) => setExpTimeframe(e.target.value)}
                required
                placeholder="e.g. 2022 - Present"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-achievements">
                Key Achievements (one per line)
              </label>
              <textarea
                id="exp-achievements"
                value={expAchievements}
                onChange={(e) => setExpAchievements(e.target.value)}
                required
                placeholder={"Led a team of 5 engineers to ship a new product feature\nReduced API response time by 40% through caching optimizations\nMentored 3 junior developers"}
                className="custom-textarea"
                rows={6}
              />
              {expAchievements && (
                <Column gap="4" marginTop="8">
                  {parseAchievements(expAchievements).map((achievement, i) => (
                    <Row key={i} gap="8" vertical="start">
                      <Text variant="body-default-xs" onBackground="brand-medium" style={{ minWidth: "16px" }}>•</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">{achievement}</Text>
                    </Row>
                  ))}
                </Column>
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-image">Company/Role Image (optional)</label>
              <input
                id="exp-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, setExpImageFile, setExpImagePreview)}
                className="custom-file-input"
              />
              {expImagePreview && (
                <img
                  src={expImagePreview}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-m)",
                    border: "1px solid var(--neutral-border-weak)",
                  }}
                />
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="exp-sort">
                Sort Order (lower = appears first)
              </label>
              <Input
                id="exp-sort"
                type="number"
                value={expSortOrder}
                onChange={(e) => setExpSortOrder(e.target.value)}
                placeholder="0"
              />
            </div>

            <Button type="submit" disabled={expStatus === "saving"} fillWidth size="m">
              {expStatus === "saving" ? "Saving..." : "Add Work Experience"}
            </Button>

            {expStatus === "saved" && (
              <Text variant="body-default-s" style={{ color: "var(--brand-on-background-medium)" }} align="center">
                ✓ Work experience added successfully!
              </Text>
            )}
            {expStatus === "error" && (
              <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
                Error: {expErrorMessage || "Failed to add work experience."}
              </Text>
            )}
          </form>
        </Column>
      )}

      {/* Technical Skill Form */}
      {activeTab === "skill" && (
        <Column
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="xl"
          fillWidth
          gap="m"
          shadow="l"
        >
          <Heading variant="heading-strong-m" marginBottom="s">
            Add Technical Skill
          </Heading>

          <form onSubmit={handlePublishSkill} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="custom-form-group">
              <label className="custom-label" htmlFor="skill-title">Skill Title</label>
              <Input
                id="skill-title"
                type="text"
                value={skillTitle}
                onChange={(e) => setSkillTitle(e.target.value)}
                required
                placeholder="e.g. React, Next.js, Figma, Python"
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="skill-desc">Description (optional)</label>
              <textarea
                id="skill-desc"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
                placeholder="Brief description of your proficiency and experience with this skill"
                className="custom-textarea"
                rows={3}
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="skill-tags">Related Technologies (comma separated)</label>
              <Input
                id="skill-tags"
                type="text"
                value={skillTags}
                onChange={(e) => setSkillTags(e.target.value)}
                placeholder="e.g. JavaScript, TypeScript, Node.js"
              />
              {skillTags && (
                <Row gap="8" wrap marginTop="8">
                  {parseTags(skillTags).map((tag) => (
                    <Text
                      key={tag}
                      variant="body-default-xs"
                      style={{
                        backgroundColor: "var(--neutral-alpha-weak)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-s)",
                        border: "1px solid var(--neutral-border-weak)",
                      }}
                    >
                      {tag}
                    </Text>
                  ))}
                </Row>
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="skill-image">Skill Image (optional)</label>
              <input
                id="skill-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, setSkillImageFile, setSkillImagePreview)}
                className="custom-file-input"
              />
              {skillImagePreview && (
                <img
                  src={skillImagePreview}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-m)",
                    border: "1px solid var(--neutral-border-weak)",
                  }}
                />
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="skill-sort">
                Sort Order (lower = appears first)
              </label>
              <Input
                id="skill-sort"
                type="number"
                value={skillSortOrder}
                onChange={(e) => setSkillSortOrder(e.target.value)}
                placeholder="0"
              />
            </div>

            <Button type="submit" disabled={skillStatus === "saving"} fillWidth size="m">
              {skillStatus === "saving" ? "Saving..." : "Add Technical Skill"}
            </Button>

            {skillStatus === "saved" && (
              <Text variant="body-default-s" style={{ color: "var(--brand-on-background-medium)" }} align="center">
                ✓ Technical skill added successfully!
              </Text>
            )}
            {skillStatus === "error" && (
              <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
                Error: {skillErrorMessage || "Failed to add technical skill."}
              </Text>
            )}
          </form>
        </Column>
      )}

      {/* Gallery Image Form */}
      {activeTab === "gallery" && (
        <Column
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="xl"
          fillWidth
          gap="m"
          shadow="l"
        >
          <Heading variant="heading-strong-m" marginBottom="s">
            Upload Gallery Image
          </Heading>

          <form onSubmit={handlePublishGallery} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="custom-form-group">
              <label className="custom-label" htmlFor="gallery-image">Select Image</label>
              <input
                id="gallery-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, setGalleryImageFile, setGalleryImagePreview)}
                required
                className="custom-file-input"
              />
              {galleryImagePreview && (
                <img
                  src={galleryImagePreview}
                  alt="Preview"
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius-m)",
                    border: "1px solid var(--neutral-border-weak)",
                  }}
                />
              )}
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="gallery-alt">Alt Text</label>
              <Input
                id="gallery-alt"
                type="text"
                value={galleryAlt}
                onChange={(e) => setGalleryAlt(e.target.value)}
                required
                placeholder="e.g. Workspace setup, sunset photography, etc."
              />
            </div>

            <div className="custom-form-group">
              <label className="custom-label" htmlFor="gallery-orientation">Orientation</label>
              <select
                id="gallery-orientation"
                value={galleryOrientation}
                onChange={(e) => setGalleryOrientation(e.target.value as "horizontal" | "vertical")}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-m)",
                  backgroundColor: "var(--neutral-alpha-weak)",
                  border: "1px solid var(--neutral-border-weak)",
                  color: "var(--neutral-on-background-strong)",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="horizontal" style={{ backgroundColor: "var(--surface-color)" }}>Horizontal (16:9)</option>
                <option value="vertical" style={{ backgroundColor: "var(--surface-color)" }}>Vertical (3:4)</option>
              </select>
            </div>

            <Button type="submit" disabled={galleryStatus === "saving"} fillWidth size="m">
              {galleryStatus === "saving" ? "Uploading..." : "Upload & Save to Gallery"}
            </Button>

            {galleryStatus === "saved" && (
              <Text variant="body-default-s" style={{ color: "var(--brand-on-background-medium)" }} align="center">
                ✓ Image uploaded and saved to gallery successfully!
              </Text>
            )}
            {galleryStatus === "error" && (
              <Text variant="body-default-s" style={{ color: "var(--accent-on-background-medium)" }} align="center">
                Error: {galleryErrorMessage || "Failed to upload gallery image."}
              </Text>
            )}
          </form>
        </Column>
      )}
    </Column>
  );
}
