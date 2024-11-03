import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";
import ServiceCard from '@/components/services/ServiceCard';
import ServiceCost from '@/components/services/ServiceCost';

export const Route = createLazyFileRoute('/project/$projectId/')({
  component: () => <ProjectId />
})

type Service = {
  id: string
  name: string
  imageRegistryUrl: string
  publicIP: string
  publicPort: number
}

const servicesMock: Service[] = [
  {
    id: "1",
    name: "Service 1",
    imageRegistryUrl: "registry.com/service1",
    publicIP: "10.0.24.39",
    publicPort: 8080,
  },
  {
    id: "2",
    name: "Service 2",
    imageRegistryUrl: "registry.com/service2",
    publicIP: "10.0.25.34",
    publicPort: 8081,
  },
  {
    id: "3",
    name: "Service 3",
    imageRegistryUrl: "registry.com/service3",
    publicIP: "10.0.34.12",
    publicPort: 8082,
  },
];

function ProjectId() {
  const { projectId } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container py-8 space-y-8 mx-auto">
        {/* Project Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Project { projectId }</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <CiSettings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Link to={`/project/${projectId}/service/create`}>
              <Button>
                <FiPlus className="mr-2 h-4 w-4" />
                Create Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {
              servicesMock.map(service => (
                <ServiceCard key={service.id} service={service} projectId={projectId} />
              ))
            }
          </div>
        </section>

        {/* Usage Cost Section */}
        <section>
            <ServiceCost services={servicesMock} />
        </section>
      </main>
    </div>
  );
}