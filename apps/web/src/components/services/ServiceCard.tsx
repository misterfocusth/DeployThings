import { Link } from "@tanstack/react-router"

type Service = {
    id: string
    name: string
    imageRegistryUrl: string
    publicIP: string
    publicPort: number
  }

type ServiceCardProps = {
    service: Service
    projectId: string
}

const ServiceCard = ({service, projectId}:ServiceCardProps) => {
  return (
    <Link to={`/project/${projectId}/service/${service.id}`} className="w-full border border-gray-400 hover:border-2 hover:border-black px-3 py-2 rounded-md transition duration-150 box-border">
        <p className="font-semibold">{service.name}</p>
        <p className="text-muted-foreground truncate">{service.imageRegistryUrl}</p>
        <p className="text-muted-foreground">{service.publicIP}:{service.publicPort}</p>
    </Link>
  )
}

export default ServiceCard