import { createLazyFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from 'react'
import { api } from '@/lib/tsr-react-query'

export const Route = createLazyFileRoute('/project/$projectId/service/create/')({
  component: () => <NewService />
})

const computeOptions = [
  {
    id: "1",
    name: 'General Purpose',
    availableCPU: 1,
    availableMemory: 2,
    costPerHour: 3
  },
  {
    id: "2",
    name: 'Memory Optimized',
    availableCPU: 2,
    availableMemory: 8,
    costPerHour: 6
  },
  {
    id: "3",
    name: 'CPU Optimized',
    availableCPU: 4,
    availableMemory: 8,
    costPerHour: 5
  },
  {
    id: "4",
    name: 'Compute Accelerated',
    availableCPU: 8,
    availableMemory: 16,
    costPerHour: 4
  }
]

const storageOptions = [
  {
    id: "1",
    name: 'SSD v1',
    storageSize: 64,
    costPerHour: 1
  },
  {
    id: "2",
    name: 'SSD v2',
    storageSize: 128,
    costPerHour: 2
  },
  {
    id: "3",
    name: 'SSD v3',
    storageSize: 256,
    costPerHour: 4
  },
  {
    id: "4",
    name: 'SSD v4',
    storageSize: 512,
    costPerHour: 8
  },
]

const osOptions = [
  "LINUX_X86_64",
  "LINUX_ARM64",
  "WINDOWS_SERVER_2019_CORE",
  "WINDOWS_SERVER_2019_FULL",
  "WINDOWS_SERVER_2022_CORE",
  "WINDOWS_SERVER_2022_FULL"
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registry: z.object({
    type: z.enum(['DOCKER_REGISTRY', 'TEMPLATE_REGISTRY']),
    template: z.enum(['nginx', 'mysql', 'redis', 'mongo']).optional(),
    url: z.string().optional(),
    internalPort: z.number().int().min(1, "Port is required"),
    externalPort: z.number().int().min(1, "Port is required"),
  }),
  computing: z.object({
    os: z.enum(['LINUX_X86_64', 'LINUX_ARM64', 'WINDOWS_SERVER_2019_CORE', 'WINDOWS_SERVER_2019_FULL', 'WINDOWS_SERVER_2022_CORE', 'WINDOWS_SERVER_2022_FULL']),
    power: z.enum(['General Purpose', 'Memory Optimized', 'CPU Optimized', 'Compute Accelerated']),
    storage: z.enum(['SSD v1', 'SSD v2', 'SSD v3', 'SSD v4']),
  }),
  environment: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ).optional(),
  providerBase: z.number().default(1),
  providerWeight: z.number().default(1),
})


export function NewService() {
  const { projectId } = Route.useParams()
  const [cost, setCost] = useState({ power: 3, storage: 1 })
  const { data: images, isFetching, isLoading } = api.image.listImages.useQuery({ queryKey: ["images"] })

  const templateRegistry = images?.body.filter(image => {
    const templateImages = ['nginx', 'mysql', 'redis', 'mongo', 'postgres']
    return templateImages.includes(image.repository.name)
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      computing: {
        os: "LINUX_X86_64",
        power: "General Purpose",
        storage: "SSD v1",
      },
      environment: [{ key: "", value: "" }],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { mutateAsync: createImages } = api.image.pullAndUploadImage.useMutation()
    const { mutateAsync: createTask } = api.task.createTask.useMutation()
    const { mutateAsync: createService } = api.service.createService.useMutation()

    let imageId;
    if (values.registry.type === 'DOCKER_REGISTRY') {
      const { body:imageResponse } = await createImages({
        body: {
          imageName: values.registry.url as string,
          userId: "1"
        }
      })
      imageId = imageResponse.id
    } else {
      imageId = values.registry.template
    }

    const { body:taskResponse } = await createTask({
      body: {
        containerName: values.name,
        taskName: values.name,
        userId: "1",
        os: values.computing.os,
        computingOptionId: computeOptions.find(option => option.name === values.computing.power)?.id || "1",
        storageOptionId: storageOptions.find(option => option.name === values.computing.storage)?.id || "1",
        userImageId: imageId as string,
        portMapping: {
          containerPort: values.registry.internalPort,
          containerPortProtocol: "http",
          exposedPort: values.registry.externalPort,
          exposedPortProtocol: "tcp"
        },
        environmentVariables: values.environment?.map(env => ({ key: env.key, value: env.value }))
      }
    })

    await createService({
      body: {
        serviceName: values.name,
        userId: "1",
        taskDefinitionId: taskResponse.id,
        providerBase: values.providerBase,
        providerWeight: values.providerWeight
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main className="container py-8 space-y-8 mx-auto">
        <div>
          <p className="text-sm text-muted-foreground">Project {projectId}</p>
          <h1 className="text-3xl font-semibold">New Service</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold text-lg'>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Container */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-bold text-lg">Container</h3>
                <FormField
                  control={form.control}
                  name="registry.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registry Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          {...field}
                          className="grid gap-4 sm:grid-cols-2"
                          name="registry.type"
                          onValueChange={(value) => form.setValue("registry.type", value as any)}
                        >
                          <div>
                            <RadioGroupItem value="DOCKER_REGISTRY" id="DOCKER_REGISTRY" className="peer sr-only" />
                            <Label
                              htmlFor="DOCKER_REGISTRY"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <span className="font-semibold">Docker Registry</span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="TEMPLATE_REGISTRY" id="TEMPLATE_REGISTRY" className="peer sr-only" />
                            <Label
                              htmlFor="TEMPLATE_REGISTRY"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <span className="font-semibold">Template Registry</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {
                  form.watch("registry.type") === 'DOCKER_REGISTRY' && (
                    <FormField
                      control={form.control}
                      name="registry.url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Registry URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />)
                }
                {
                  form.watch("registry.type") === 'TEMPLATE_REGISTRY' && (
                    <FormField
                      control={form.control}
                      name="registry.template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template</FormLabel>
                          <FormControl>
                            <RadioGroup
                              {...field}
                              className="grid gap-4 grid-cols-2 md:grid-cols-4"
                              name="registry.template"
                              onValueChange={(value) => form.setValue("registry.template", value as any)}
                            >
                              {
                              (isLoading || isFetching) && templateRegistry?.map(option => (
                                <div key={option.id}>
                                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                  <Label
                                    htmlFor={option.id}
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                  >
                                    <span className="font-semibold">{option.imageName}</span>
                                  </Label>
                                </div>
                              ))
                              }
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />)
                }
                <div className="space-y-4">
                  <Label>Port Mapping</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="registry.externalPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type='number' placeholder="ExternalPort" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="registry.internalPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type='number' placeholder="InternalPort" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Computing Configuration */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="font-bold text-lg">Computing Configuration</h3>

                <div className='space-y-4'>
                  <Label>Operating System</Label>
                  <RadioGroup
                    defaultValue="LINUX_X86_64"
                    className="grid gap-4 grid-cols-1 md:grid-cols-3"
                    onValueChange={(value) => form.setValue("computing.os", value as any)}
                  >
                    {
                      osOptions.map(option => (
                        <div key={option}>
                          <RadioGroupItem value={option} id={option} className="peer sr-only" />
                          <Label
                            htmlFor={option}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="font-semibold">{option}</span>
                          </Label>
                        </div>
                      ))
                    }
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label>Computing Power</Label>
                  <RadioGroup
                    defaultValue="General Purpose"
                    className="grid gap-4 sm:grid-cols-4"
                    onValueChange={(value) => { form.setValue("computing.power", value as any); setCost({ power: computeOptions.find(option => option.name === value)?.costPerHour || 3, storage: cost.storage }) }}
                  >
                    {
                      computeOptions.map(option => (
                        <div key={option.id}>
                          <RadioGroupItem value={option.name} id={option.name} className="peer sr-only" />
                          <Label
                            htmlFor={option.name}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="font-semibold">{option.name}</span>
                            <span className="text-sm text-muted-foreground">{option.availableCPU} vCPU, {option.availableMemory}GB Memory</span>
                          </Label>
                        </div>
                      ))
                    }
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label>Storage</Label>
                  <RadioGroup
                    defaultValue="SSD v1"
                    className="grid gap-4 sm:grid-cols-4"
                    onValueChange={(value) => { form.setValue("computing.storage", value as any); setCost({ power: cost.power, storage: storageOptions.find(option => option.name === value)?.costPerHour || 1 }) }}
                  >
                    {
                      storageOptions.map(option => (
                        <div key={option.id}>
                          <RadioGroupItem value={option.name} id={option.name} className="peer sr-only" />
                          <Label
                            htmlFor={option.name}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <span className="font-semibold">{option.name}</span>
                            <span className="text-sm text-muted-foreground">{option.storageSize}GB</span>
                          </Label>
                        </div>
                      ))
                    }
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Provider */}
            <FormField
              control={form.control}
              name="providerBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Base</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="providerWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Weight</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Environment Variables */}
            <div className="space-y-4">
              <Label className='font-bold text-lg'>Environment Variables</Label>
              <div className="grid gap-4">
                {form.watch("environment")?.map((_, index) => (
                  <div key={index} className="grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="Key"
                      onChange={(e) =>
                        form.setValue(`environment.${index}.key`, e.target.value)
                      }
                    />
                    <Input
                      placeholder="Value"
                      onChange={(e) =>
                        form.setValue(`environment.${index}.value`, e.target.value)
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("environment", [
                      ...(form.watch("environment") || []),
                      { key: "", value: "" },
                    ])
                  }
                >
                  Add more
                </Button>
              </div>
            </div>

            {/* Cost Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Cost</h3>
                    <p className="text-sm text-muted-foreground">Fixed cost per hour</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{cost.power + cost.storage} USD</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">Create</Button>
          </form>
        </Form>
      </main>
    </div>
  )
}