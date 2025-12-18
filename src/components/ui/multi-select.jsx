import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Selecione...",
    searchPlaceholder = "Buscar...",
    className,
    maxBadges = 3 // Max defined badges to show before "+N"
}) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
        if (!searchTerm) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleSelect = (value) => {
        const newSelected = new Set(selected);
        if (newSelected.has(value)) {
            newSelected.delete(value);
        } else {
            newSelected.add(value);
        }
        onChange(Array.from(newSelected));
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange([]);
        setSearchTerm("");
    };

    const selectedCount = selected.length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-[48px] px-3 py-2 bg-black/20 border-white/10 text-white hover:bg-black/30 hover:text-white",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
                        {selectedCount === 0 && (
                            <span className="text-gray-500 font-normal">{placeholder}</span>
                        )}

                        {selectedCount > 0 && (
                            <>
                                {options
                                    .filter((opt) => selected.includes(opt.value))
                                    .slice(0, maxBadges)
                                    .map((option) => (
                                        <Badge
                                            key={option.value}
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal bg-primary/20 text-primary hover:bg-primary/30 border-primary/20"
                                        >
                                            {option.label}
                                            <span
                                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                onClick={() => handleSelect(option.value)}
                                            >
                                                <X className="h-3 w-3 text-primary/70 hover:text-primary" />
                                            </span>
                                        </Badge>
                                    ))}
                                {selectedCount > maxBadges && (
                                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                                        +{selectedCount - maxBadges}
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {selectedCount > 0 && (
                            <div
                                onClick={handleClear}
                                className="mr-1 rounded-full p-0.5 hover:bg-white/10 cursor-pointer"
                            >
                                <X className="h-4 w-4 text-muted-foreground hover:text-white" />
                            </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-zinc-950 border-white/10" align="start">
                <div className="flex flex-col max-h-[300px]">
                    <div className="p-2 border-b border-white/10">
                        <input
                            className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum resultado encontrado.
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-white/10 hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                            isSelected ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-gray-300"
                                        )}
                                        onClick={() => handleSelect(option.value)}
                                    >
                                        <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/50", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                            <Check className={cn("h-4 w-4 text-white")} />
                                        </div>
                                        <span>{option.label}</span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    {/* Footer with actions (optional) */}
                    <div className="p-2 border-t border-white/10 flex justify-end gap-2">
                        <span className="text-xs text-muted-foreground self-center mr-auto">
                            {selectedCount} selecionado(s)
                        </span>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
