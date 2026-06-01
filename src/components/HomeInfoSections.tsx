import HomeInfoAccordion from "@/components/HomeInfoAccordion";
import HomeInfoPanel from "@/components/HomeInfoPanel";
import { homeSections } from "@/lib/site";

const tabSections = homeSections.map((section) => ({
  id: section.id,
  title: section.title,
  href: section.href,
  highlight: "highlight" in section ? section.highlight : undefined,
}));

export default function HomeInfoSections() {
  return (
    <HomeInfoAccordion sections={tabSections}>
      {homeSections.map((section, index) => (
        <HomeInfoPanel key={section.id} section={section} index={index} />
      ))}
    </HomeInfoAccordion>
  );
}
