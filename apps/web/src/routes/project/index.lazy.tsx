import { createLazyFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectCost from "@/components/projects/ProjectCost";
import { useState, useEffect } from "react";

export const Route = createLazyFileRoute('/project/')({
  component: () => <About />
})

type Project = {
  id: string
  name: string
  description: string
  cost: number
  createdAt: string
}

const projectsMock: Project[] = [
  {
    id: "1",
    name: "Project 1",
    description: "Description 1",
    cost: 1000,
    createdAt: "2021-10-01",
  },
  {
    id: "2",
    name: "Project 2",
    description: "Description 2",
    cost: 2000,
    createdAt: "2021-10-02",
  },
  {
    id: "3",
    name: "Project 3",
    description: "Description 3",
    cost: 3000,
    createdAt: "2021-10-03",
  },
  {
    id: "4",
    name: "Project 4",
    description: "Description 4",
    cost: 4000,
    createdAt: "2021-10-04",
  },
];

function About() {
  const [currentTime, setCurrentTime] = useState(new Date());

  function formatTime(date: Date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container py-8 mx-auto flex flex-col gap-y-5">
        {/* Greeting */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className='font-bold text-xl'>Deploythings</h1>
            <p className="text-lg">Hello, User. It's currently {formatTime(currentTime)}</p>
          </div>
          <Button>
            <FiPlus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
        <hr />
        {/* Projects Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {
              projectsMock.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            }
          </div>
        </section>
        <hr />
        {/* Cost Section */}
        <section>
          <ProjectCost projects={projectsMock} />
        </section>
      </main>
    </div>
  );
}
