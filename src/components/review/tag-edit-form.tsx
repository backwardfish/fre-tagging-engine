"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ASSET_TYPE_OPTIONS,
  PRODUCT_LINE_OPTIONS,
  FLAVOR_OPTIONS,
  NICOTINE_STRENGTH_OPTIONS,
  PACK_FORMAT_OPTIONS,
  CONTENT_THEME_OPTIONS,
  SETTING_OPTIONS,
  USAGE_RIGHTS_OPTIONS,
} from "@/lib/constants";
import type { SelectAsset } from "@/db/schema";
import { X } from "lucide-react";

interface TagEditFormProps {
  asset: SelectAsset;
  onSubmit: (tags: Record<string, unknown>, note: string) => void;
  onCancel: () => void;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1 min-h-[32px] rounded-md border p-2">
        {selected.map((val) => (
          <Badge
            key={val}
            variant="secondary"
            className="text-xs cursor-pointer"
            onClick={() => onChange(selected.filter((s) => s !== val))}
          >
            {val}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {options
          .filter((o) => !selected.includes(o))
          .map((option) => (
            <Badge
              key={option}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => onChange([...selected, option])}
            >
              + {option}
            </Badge>
          ))}
      </div>
    </div>
  );
}

export function TagEditForm({ asset, onSubmit, onCancel }: TagEditFormProps) {
  const [tags, setTags] = useState<{
    assetType: string;
    productLine: string[];
    flavor: string[];
    nicotineStrength: string[];
    packFormat: string;
    contentTheme: string[];
    setting: string[];
    campaign: string;
    usageRights: string;
    description: string;
  }>({
    assetType: asset.assetType || "Photo",
    productLine: (asset.productLine as string[]) || [],
    flavor: (asset.flavor as string[]) || [],
    nicotineStrength: (asset.nicotineStrength as string[]) || [],
    packFormat: asset.packFormat || "N/A",
    contentTheme: (asset.contentTheme as string[]) || [],
    setting: (asset.setting as string[]) || [],
    campaign: asset.campaign || "",
    usageRights: asset.usageRights || "Unlimited Internal",
    description: asset.description || "",
  });
  const [correctionNote, setCorrectionNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tags, correctionNote);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Asset Type</Label>
          <Select
            value={tags.assetType}
            onValueChange={(v) => setTags({ ...tags, assetType: v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Pack Format</Label>
          <Select
            value={tags.packFormat}
            onValueChange={(v) => setTags({ ...tags, packFormat: v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACK_FORMAT_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Usage Rights</Label>
          <Select
            value={tags.usageRights}
            onValueChange={(v) => setTags({ ...tags, usageRights: v })}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USAGE_RIGHTS_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Campaign</Label>
          <Input
            className="h-9"
            value={tags.campaign}
            onChange={(e) => setTags({ ...tags, campaign: e.target.value })}
            placeholder="e.g., PBR 2026 Activation"
          />
        </div>
      </div>

      <MultiSelect
        label="Product Line"
        options={PRODUCT_LINE_OPTIONS}
        selected={tags.productLine}
        onChange={(v) => setTags({ ...tags, productLine: v })}
      />

      <MultiSelect
        label="Flavor"
        options={FLAVOR_OPTIONS}
        selected={tags.flavor}
        onChange={(v) => setTags({ ...tags, flavor: v })}
      />

      <MultiSelect
        label="Nicotine Strength"
        options={NICOTINE_STRENGTH_OPTIONS}
        selected={tags.nicotineStrength}
        onChange={(v) => setTags({ ...tags, nicotineStrength: v })}
      />

      <MultiSelect
        label="Content Theme"
        options={CONTENT_THEME_OPTIONS}
        selected={tags.contentTheme}
        onChange={(v) => setTags({ ...tags, contentTheme: v })}
      />

      <MultiSelect
        label="Setting"
        options={SETTING_OPTIONS}
        selected={tags.setting}
        onChange={(v) => setTags({ ...tags, setting: v })}
      />

      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={tags.description}
          onChange={(e) => setTags({ ...tags, description: e.target.value })}
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Correction Note (optional)</Label>
        <Input
          value={correctionNote}
          onChange={(e) => setCorrectionNote(e.target.value)}
          placeholder="Why was the AI wrong? e.g., 'This is from the PBR partnership'"
          className="h-9"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
