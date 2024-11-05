import { Link } from "@tanstack/react-router"
import { ListServiceResponse } from "node_modules/@repo/contracts/routes/service"


type ServiceCardProps = {
    service: ListServiceResponse[number]
    projectId: string
}

const ServiceCard = ({service, projectId}:ServiceCardProps) => {
  console.log(service)
  return (
    <Link to={`/project/${projectId}/service/${service.id}`} className="w-full border border-gray-400 hover:border-2 hover:border-black px-3 py-2 rounded-md transition duration-150 box-border">
        <p className="font-semibold">{service.name}</p>
        <p className="text-muted-foreground truncate">{service.taskDefinition.userImage.repository.uri}</p>
        <p className="text-muted-foreground">{service.publicIP}:{service.publicPort}</p>
    </Link>
  )
}

export default ServiceCard