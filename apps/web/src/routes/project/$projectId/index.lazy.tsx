import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { CiSettings } from "react-icons/ci";
import ServiceCard from '@/components/services/ServiceCard';
import ServiceCost from '@/components/services/ServiceCost';
import { api } from "@/lib/tsr-react-query";
import { ListServiceResponse } from "node_modules/@repo/contracts/routes/service"

export const Route = createLazyFileRoute('/project/$projectId/')({
  component: () => <ProjectId />
})

function ProjectId() {
  const { projectId } = Route.useParams();
  const { data } = api.service.listServices.useQuery({
    queryKey: ["services"]
  });
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
              data?.body.map((service: ListServiceResponse[number]) => (
                <ServiceCard key={service.id} service={service} projectId={projectId} />
              ))
            }
          </div>
        </section>

        {/* Usage Cost Section */}
        <section>
            <ServiceCost services={data?.body} />
        </section>
      </main>
    </div>
  );
}