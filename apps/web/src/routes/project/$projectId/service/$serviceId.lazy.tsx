import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/project/$projectId/service/$serviceId')({
  component: () => <div>Hello /project/$projectId/service/create/$serviceId!</div>
})