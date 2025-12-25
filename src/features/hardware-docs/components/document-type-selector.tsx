import { cn } from "@/utils/cn";
import type { DocumentType } from "../types/hardware-docs";

interface DocumentTypeSelectorProps {
  value: DocumentType | "all";
  onChange: (value: DocumentType | "all") => void;
}

const DOCUMENT_TYPES: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "datasheet", label: "Datasheets" },
  { value: "reference-manual", label: "Reference Manuals" },
  { value: "schematic", label: "Schematics" },
  { value: "company-knowledge", label: "Company Knowledge" },
  { value: "other", label: "Other" },
];

export function DocumentTypeSelector({ value, onChange }: DocumentTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {DOCUMENT_TYPES.map((type) => (
        <button
          type="button"
          key={type.value}
          onClick={() => onChange(type.value)}
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium transition-colors",
            value === type.value
              ? "bg-accent text-white"
              : "bg-secondary-bg text-text-light hover:bg-hover hover:text-text",
          )}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
