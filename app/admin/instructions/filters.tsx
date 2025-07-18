"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Tag } from "lucide-react";
import { useCallback, useTransition } from "react";

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Category display names
  const categoryDisplayNames: Record<string, string> = {
    'innovation_instruction': 'Innovation Instructions',
    'course_videos': 'Course Videos',
    'main_chat_instructions': 'Main Chat Instructions',
    'global_instructions': 'Global Instructions',
    'product_features': 'Product Features',
    'faq_content': 'FAQ Content',
    'internal_knowledge_base': 'Internal Knowledge Base',
    'uncategorized': 'Uncategorized'
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search instructions..."
            className="pl-9 h-10 rounded-md border-neutral-200"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              startTransition(() => {
                router.push(
                  `?${createQueryString("search", e.target.value)}`,
                  { scroll: false }
                );
              });
            }}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground mr-3 hidden sm:inline">Category:</span>
            <Select
              value={searchParams.get("category") ?? "all"}
              onValueChange={(value) => {
                startTransition(() => {
                  router.push(
                    `?${createQueryString("category", value === "all" ? "" : value)}`,
                    { scroll: false }
                  );
                });
              }}
            >
              <SelectTrigger className="w-[200px] h-10 rounded-md border-neutral-200">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryDisplayNames).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground mr-3 hidden sm:inline">Type:</span>
            <Select
              value={searchParams.get("type") ?? "all"}
              onValueChange={(value) => {
                startTransition(() => {
                  router.push(
                    `?${createQueryString("type", value === "all" ? "" : value)}`,
                    { scroll: false }
                  );
                });
              }}
            >
              <SelectTrigger className="w-[180px] h-10 rounded-md border-neutral-200">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">Document</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="loom">Loom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 