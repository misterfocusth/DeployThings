import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Server, Variable, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createLazyFileRoute('/project/$projectId/service/$serviceId')({
  component: () => <TaskManagementDashboardComponent />
})

interface TaskDefinition {
  id: string
  name: string
  arn: string
  revision: number
  taskRoleArn: string
  executionRoleArn: string
  launchType: 'EC2' | 'FARGATE' | 'EXTERNAL'
  operatingSystem: 'LINUX' | 'WINDOWS'
  containerName: string
  containerPort: number
  containerPortProtocol: 'tcp' | 'udp'
  exposedPort: number
  exposedPortProtocol: 'tcp' | 'udp'
  createdAt: string
  updatedAt: string
}

interface Service {
  id: string
  arn: string
  name: string
  publicIP: string
  publicPort: number
  providerBase: number
  providerWeight: number
  createdAt: string
  updatedAt: string
}

interface TaskEnvironmentVariable {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

interface TaskCredential {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

export function TaskManagementDashboardComponent() {
  const [activeTab, setActiveTab] = useState("task-definition")
  const taskDefinition:TaskDefinition = {
    id: "task-def-1",
    name: "web-app",
    arn: "arn:aws:ecs:us-west-2:123456789012:task-definition/web-app:1",
    revision: 1,
    taskRoleArn: "arn:aws:iam::123456789012:role/ecsTaskRole",
    executionRoleArn: "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
    launchType: "FARGATE",
    operatingSystem: "LINUX",
    containerName: "web",
    containerPort: 80,
    containerPortProtocol: "tcp",
    exposedPort: 8080,
    exposedPortProtocol: "tcp",
    createdAt: "2023-05-01T12:00:00Z",
    updatedAt: "2023-05-02T14:30:00Z"
  }
  const service:Service = {
    id: "svc-1",
    arn: "arn:aws:ecs:us-west-2:123456789012:service/web-app-service",
    name: "web-app-service",
    publicIP: "203.0.113.0",
    publicPort: 80,
    providerBase: 100,
    providerWeight: 1,
    createdAt: "2023-05-01T12:30:00Z",
    updatedAt: "2023-05-02T15:00:00Z"
  }
  const environmentVariables: TaskEnvironmentVariable[] = [
    {
      id: "env-1",
      key: "NODE_ENV",
      value: "production",
      createdAt: "2023-05-01T12:15:00Z",
      updatedAt: "2023-05-01T12:15:00Z"
    },
    {
      id: "env-2",
      key: "API_URL",
      value: "https://api.example.com",
      createdAt: "2023-05-01T12:16:00Z",
      updatedAt: "2023-05-01T12:16:00Z"
    }
  ]

  const credentials: TaskCredential[] = [
    {
      id: "cred-1",
      key: "DB_PASSWORD",
      value: "********",
      createdAt: "2023-05-01T12:20:00Z",
      updatedAt: "2023-05-01T12:20:00Z"
    },
    {
      id: "cred-2",
      key: "API_KEY",
      value: "********",
      createdAt: "2023-05-01T12:21:00Z",
      updatedAt: "2023-05-01T12:21:00Z"
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10 mb-10">
      <CardHeader>
        <div className='flex justify-between w-full'>
          <CardTitle className="text-2xl font-bold">Service: { service.name }</CardTitle>
          <Button variant={'destructive'}>Delete Service</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Credentials</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="task-definition">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Task Definition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="ID" value={taskDefinition.id} />
                <InfoItem label="Name" value={taskDefinition.name} />
                <InfoItem label="ARN" value={taskDefinition.arn} />
                <InfoItem label="Revision" value={taskDefinition.revision.toString()} />
                <InfoItem label="Task Role ARN" value={taskDefinition.taskRoleArn} />
                <InfoItem label="Execution Role ARN" value={taskDefinition.executionRoleArn} />
                <InfoItem label="Launch Type" value={taskDefinition.launchType} />
                <InfoItem label="Operating System" value={taskDefinition.operatingSystem} />
                <InfoItem label="Container Name" value={taskDefinition.containerName} />
                <InfoItem label="Container Port" value={`${taskDefinition.containerPort} (${taskDefinition.containerPortProtocol})`} />
                <InfoItem label="Exposed Port" value={`${taskDefinition.exposedPort} (${taskDefinition.exposedPortProtocol})`} />
                <InfoItem label="Created At" value={format(new Date(taskDefinition.createdAt), "PPpp")} />
                <InfoItem label="Updated At" value={format(new Date(taskDefinition.updatedAt), "PPpp")} />
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
              {environmentVariables.map((envVar, index) => (
                <div key={envVar.id} className="mb-4">
                  <h4 className="text-md font-semibold">Variable {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoItem label="Key" value={envVar.key} />
                    <InfoItem label="Value" value={envVar.value} />
                    <InfoItem label="Created At" value={format(new Date(envVar.createdAt), "PPpp")} />
                    <InfoItem label="Updated At" value={format(new Date(envVar.updatedAt), "PPpp")} />
                  </div>
                  {index < environmentVariables.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="credentials">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <h3 className="text-lg font-semibold mb-2">Credentials</h3>
              {credentials.map((credential, index) => (
                <div key={credential.id} className="mb-4">
                  <h4 className="text-md font-semibold">Credential {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <InfoItem label="Key" value={credential.key} />
                    <InfoItem label="Value" value={credential.value} />
                    <InfoItem label="Created At" value={format(new Date(credential.createdAt), "PPpp")} />
                    <InfoItem label="Updated At" value={format(new Date(credential.updatedAt), "PPpp")} />
                  </div>
                  {index < credentials.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
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