import { Badge } from "@/components/ui/badge";

interface TagChipsProps {
  label: string;
  values: string | string[] | null | undefined;
}

export function TagChips({ label, values }: TagChipsProps) {
  if (!values) return null;

  const items = Array.isArray(values) ? values : [values];
  if (items.length === 0 || (items.length === 1 && items[0] === "N/A"))
    return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        {label}:
      </span>
      {items.map((val) => (
        <Badge key={val} variant="secondary" className="text-xs">
          {val}
        </Badge>
      ))}
    </div>
  );
}

interface TagGroupProps {
  asset: {
    assetType?: string | null;
    productLine?: string[] | null;
    flavor?: string[] | null;
    nicotineStrength?: string[] | null;
    packFormat?: string | null;
    contentTheme?: string[] | null;
    setting?: string[] | null;
    campaign?: string | null;
    usageRights?: string | null;
  };
}

export function TagGroup({ asset }: TagGroupProps) {
  return (
    <div className="space-y-1.5">
      <TagChips label="Type" values={asset.assetType} />
      <TagChips label="Product" values={asset.productLine} />
      <TagChips label="Flavor" values={asset.flavor} />
      <TagChips label="Strength" values={asset.nicotineStrength} />
      <TagChips label="Format" values={asset.packFormat} />
      <TagChips label="Theme" values={asset.contentTheme} />
      <TagChips label="Setting" values={asset.setting} />
      <TagChips label="Campaign" values={asset.campaign} />
      <TagChips label="Rights" values={asset.usageRights} />
    </div>
  );
}
