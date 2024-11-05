import { Link } from "@tanstack/react-router"

type Project = {
    id: string
    name: string
    description: string
    cost: number
    createdAt: string
}

type ProjectCardProps = {
    project: Project
}

const ProjectCard = ({project}:ProjectCardProps) => {
  return (
    <Link to={`/project/${project.id}`} className="w-full border border-gray-400 hover:border-2 hover:border-black px-3 py-2 rounded-md transition duration-150 box-border">
        <p className="font-semibold">{project.name}</p>
        <p className="text-muted-foreground">{project.description}</p>
        <p className="text-muted-foreground">{project.createdAt}</p>
    </Link>
  )
}

export default ProjectCard