import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function Combobox({ options, value, onChange, placeholder = "Selecione..." }) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [options, searchTerm])

    const selectedOption = options.find(option => option.value === value)

    return (
        <div className="relative">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <div className="p-2">
                        <Input
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2"
                        />
                    </div>
                    <div className="max-h-60 overflow-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum resultado encontrado
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))
                        )}
                    </div>
                </SelectContent>
            </Select>
        </div>
    )
}
