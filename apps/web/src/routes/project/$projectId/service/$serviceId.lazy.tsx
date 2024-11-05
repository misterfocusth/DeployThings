import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Server, Variable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/tsr-react-query'
import { ListServiceResponse } from 'node_modules/@repo/contracts/routes/service'
import { useNavigate } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/project/$projectId/service/$serviceId')({
  component: () => <TaskManagementDashboardComponent />
})

export function TaskManagementDashboardComponent() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("task-definition")
  const { projectId, serviceId } = Route.useParams()
  const { data } = api.service.listServices.useQuery({
    queryKey: ["services"]
  })
  const { mutateAsync } = api.service.deleteService.useMutation()
  const service = data?.body.find((service: ListServiceResponse[number]) => service.id === serviceId)

  const deleteService = () => {
    mutateAsync({
      params: {
        id: serviceId
      },
      body: {}
    }).then(() => {
      navigate({ to: '/project/$projectId', params: { projectId: projectId } })
    })
  }

  if (!service) return null

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 mb-10">
      <CardHeader>
        <div className='flex justify-between w-full'>
          <CardTitle className="text-2xl font-bold">Service: { service.name }</CardTitle>
          <Button variant={'destructive'} onClick={deleteService}>Delete Service</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="task-definition" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Task Definition</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="env-vars" className="flex items-center gap-2">
              <Variable className="w-4 h-4" />
              <span className="hidden sm:inline">Environment Variables</span>
            </TabsTrigger>
            {/* <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Credentials</span>
            </TabsTrigger> */}
          </TabsList>
          <TabsContent value="task-definition">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Task Definition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="ID" value={service.taskDefinition.id} />
                <InfoItem label="Name" value={service.taskDefinition.name} />
                <InfoItem label="ARN" value={service.taskDefinition.arn} />
                <InfoItem label="Revision" value={service.taskDefinition.revision.toString()} />
                <InfoItem label="Task Role ARN" value={service.taskDefinition.taskRoleArn || '-'} />
                <InfoItem label="Execution Role ARN" value={service.taskDefinition.executionRoleArn || '-'} />
                <InfoItem label="Launch Type" value={service.taskDefinition.launchType} />
                <InfoItem label="Operating System" value={service.taskDefinition.operatingSystem} />
                <InfoItem label="Container Name" value={service.taskDefinition.containerName} />
                <InfoItem label="Container Port" value={`${service.taskDefinition.containerPort} (${service.taskDefinition.containerPortProtocol})`} />
                <InfoItem label="Exposed Port" value={`${service.taskDefinition.exposedPort} (${service.taskDefinition.exposedPortProtocol})`} />
                <InfoItem label="Created At" value={format(new Date(service.taskDefinition.createdAt), "PPpp")} />
                <InfoItem label="Updated At" value={format(new Date(service.taskDefinition.updatedAt), "PPpp")} />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="service">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="ID" value={service.id} />
                <InfoItem label="ARN" value={service.arn} />
                <InfoItem label="Name" value={service.name} />
                <InfoItem label="Public IP" value={service.publicIP} />
                <InfoItem label="Public Port" value={service.publicPort.toString()} />
                <InfoItem label="Provider Base" value={service.providerBase.toString()} />
                <InfoItem label="Provider Weight" value={service.providerWeight.toString()} />
                <InfoItem label="Created At" value={format(new Date(service.createdAt), "PPpp")} />
                <InfoItem label="Updated At" value={format(new Date(service.updatedAt), "PPpp")} />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="env-vars">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
              {service.taskDefinition.taskEnvironmentVariable.map((envVar, index) => (
                <div key={envVar.id} className="mb-4">
                  <h4 className="text-md font-semibold">Variable {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoItem label="Key" value={envVar.key} />
                    <InfoItem label="Value" value={envVar.value} />
                  </div>
                  {index < service.taskDefinition.taskEnvironmentVariable.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          {/* <TabsContent value="credentials">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Credentials</h3>
              {service.taskDefinition..map((credential, index) => (
                <div key={credential.id} className="mb-4">
                  <h4 className="text-md font-semibold">Credential {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoItem label="Key" value={credential.key} />
                    <InfoItem label="Value" value={credential.value} />
                    <InfoItem label="Created At" value={format(new Date(credential.createdAt), "PPpp")} />
                    <InfoItem label="Updated At" value={format(new Date(credential.updatedAt), "PPpp")} />
                  </div>
                  {index < service.taskDefinition..length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent> */}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold break-all">{value}</p>
    </div>
  )
}