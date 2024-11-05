import ExpenseChart from "./ExpenseChart"
import { useState, useEffect } from "react"

type Project = {
    id: string
    name: string
    description: string
    cost: number
    createdAt: string
}

type ProjectCostProps = {
    projects: Project[]
}

const ProjectCost = ({ projects }: ProjectCostProps) => {
    const [selectedProject, setSelectedProject] = useState<Project>(projects[0])
    const [costs, setCosts] = useState<number[]>([])

    useEffect(() => {
        const expenses = Array.from({ length: 30 }, () => Math.floor(Math.random() * 450) + 50);
        setCosts(expenses)
    }, [selectedProject])
    return (
        <div className="grid md:grid-cols-[300px,1fr] gap-x-16">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold mb-4">Cost</h2>
                {
                    projects.map(project => (
                        <div key={project.id} className={`flex justify-between items-center cursor-pointer px-3 py-2 rounded-md transition duration-150 ${selectedProject.id === project.id ? 'border-2 border-black' : 'border border-gray-400'}`} onClick={() => { setSelectedProject(project) }}>
                            <div>
                                <p className="font-semibold">{project.name}</p>
                                <p className="text-muted-foreground">{project.description}</p>
                            </div>
                            <p className="font-semibold">${project.cost}</p>
                        </div>
                    ))
                }
            </div>
            <div className="w-full">
                <ExpenseChart expenses={costs} />
            </div>
        </div>
    )
}

export default ProjectCost