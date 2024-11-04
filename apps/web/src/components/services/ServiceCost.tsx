import ExpenseChart from "./ExpenseChart"
import { useState, useEffect } from "react"
import { ListServiceResponse } from "node_modules/@repo/contracts/routes/service"


type ServiceCostProps = {
    services: ListServiceResponse|undefined
}

const ServiceCost = ({ services }: ServiceCostProps) => {
    const [selectedProject, setSelectedProject] = useState<ListServiceResponse[number]|undefined>(services && services.length > 0 ? services[0] : undefined)
    const [costs, setCosts] = useState<number[]>([])

    useEffect(() => {
        const expenses = Array.from({ length: 30 }, () => Math.floor(Math.random() * 450) + 50);
        setCosts(expenses)
    }, [selectedProject])
    return (
        <div className="grid md:grid-cols-[300px,1fr] gap-x-16">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold mb-4">Usage Cost</h2>
                {
                    services?.map(service => (
                        <div key={service.id} className={`flex justify-between items-center cursor-pointer px-3 py-2 rounded-md transition duration-150 ${selectedProject?.id === service.id ? 'border-2 border-black' : 'border border-gray-400'}`} onClick={() => { setSelectedProject(service) }}>
                            <div>
                                <p className="font-semibold">{service.name}</p>
                            </div>
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

export default ServiceCost