import { ActionPanel, OpenAction, OpenWithAction, List } from "@raycast/api";


export default function Command() {

  const projects = [
    {
      key: "1",
      ide: "PyCharm",
      icon: "icons/PyCharm.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api"
    },
    {
      key: "2",
      ide: "Visual Studio Code",
      icon: "icons/WebStorm.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api"
    },
    {
      key: "3",
      ide: "Visual Studio Code",
      icon: "icons/Visual Studio Code.png",
      name: "Project 3",
      path: "path/to/project/3"
    }
  ]

  return (
    <List isLoading={projects.length === 0} searchBarPlaceholder="Filter articles by name...">
      {projects.map((project) => (
        <ProjectListItem key={project.key} project={project} />
      ))}
    </List>
  );
}


function ProjectListItem(props: { project: Project }) {
  const project = props.project;
  const title = "Open Code in " + project.ide;

  return (
    <List.Item
      key={project.key}
      title={project.name}
      subtitle={project.path}
      icon={project.icon}
      actions={[
        <ActionPanel>
          <ActionPanel.Section>
            <OpenAction
              title={title}
              icon={project.icon}
              target={project.path}
              application={project.ide}
            />
          </ActionPanel.Section>
        </ActionPanel>
      ]}
    />
  );
}


type Project = {
  key: string;
  ide: string;
  icon: string;
  name: string;
  path: string;
};

