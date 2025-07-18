# Custom Dropdown Components Usage Guide

This guide shows how to use the reusable dropdown components throughout your application.

## 🎯 Available Components

### 1. CustomDropdown (Base Component)
The foundation component that all other dropdowns are built on.

```tsx
import { CustomDropdown } from "@/components/ui/custom-dropdown";

<CustomDropdown
  value={selectedValue}
  onChange={setValue}
  placeholder="Select option"
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2", disabled: true },
    { value: "3", label: "Option 3" }
  ]}
  size="md" // "sm" | "md" | "lg"
  error={false}
  disabled={false}
  maxHeight="max-h-64"
/>
```

### 2. DepartmentDropdown
For selecting departments with building icons.

```tsx
import { DepartmentDropdown } from "@/components/ui/dropdown-helpers";

<DepartmentDropdown
  value={departmentId}
  onChange={setDepartmentId}
  departments={departments}
  placeholder="Select department"
  allowNone={true}
  noneLabel="No Department"
  size="md"
  className="w-full"
/>
```

### 3. TeamMemberDropdown
For selecting team members with avatars.

```tsx
import { TeamMemberDropdown } from "@/components/ui/dropdown-helpers";

<TeamMemberDropdown
  value={memberId}
  onChange={setMemberId}
  teamMembers={teamMembers}
  placeholder="Select team member"
  allowNone={true}
  noneLabel="No Assignee"
  size="md"
  className="w-full"
/>
```

### 4. MetricTypeDropdown
For selecting metric types with icons and format hints.

```tsx
import { MetricTypeDropdown } from "@/components/ui/dropdown-helpers";

<MetricTypeDropdown
  value={metricType}
  onChange={setMetricType}
  metricTypes={["Numeric Count", "Currency / Revenue", "Percentages"]}
  placeholder="Select metric type"
  showHints={true}
  size="md"
  className="w-full"
/>
```

### 5. DepartmentFilterDropdown
For filtering lists by department.

```tsx
import { DepartmentFilterDropdown } from "@/components/ui/dropdown-helpers";

<DepartmentFilterDropdown
  value={filterDepartment}
  onChange={setFilterDepartment}
  departments={departments}
  placeholder="All Departments"
  allLabel="All Departments"
  size="md"
  className="w-[200px]"
/>
```

## 🛠 Helper Functions

### getFormatHint
Returns format hints for metric types.

```tsx
import { getFormatHint } from "@/components/ui/dropdown-helpers";

const hint = getFormatHint("Currency / Revenue"); // "Will display as: £1,234"
```

### getMetricTypeIcon
Returns the appropriate icon component for metric types.

```tsx
import { getMetricTypeIcon } from "@/components/ui/dropdown-helpers";

const IconComponent = getMetricTypeIcon("Percentages"); // Returns Percent icon
```

## 🎨 Styling Options

### Sizes
- `sm`: Smaller height (h-8), smaller text (text-xs)
- `md`: Default height (h-9), default text (text-sm)
- `lg`: Larger height (h-10), larger text (text-base)

### Error States
```tsx
<CustomDropdown
  error={true} // Adds red border styling
  // ... other props
/>
```

### Custom Rendering
For advanced use cases, use the base `CustomDropdown` with custom render functions:

```tsx
<CustomDropdown
  options={customOptions}
  renderOption={(option) => (
    <div className="custom-option">
      {/* Your custom option rendering */}
    </div>
  )}
  renderSelected={(option) => (
    <div className="custom-selected">
      {/* Your custom selected rendering */}
    </div>
  )}
/>
```

## 📋 Type Definitions

```tsx
// For basic options
interface DropdownOption {
  value: string;
  label: string;
  data?: any;
  disabled?: boolean;
}

// For departments
interface Department {
  id: string;
  name: string;
}

// For team members
interface TeamMember {
  id: string;
  full_name: string;
  profile_picture_url?: string;
}
```

## ✨ Features

- **Consistent Design**: All dropdowns follow the same design patterns
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Works on all screen sizes
- **No Focus Conflicts**: Avoids Radix UI focus scope recursion issues
- **TypeScript**: Full type safety
- **Customizable**: Flexible sizing, styling, and rendering options

## 🚀 Quick Migration from old Select components

Replace this:
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

With this:
```tsx
<CustomDropdown
  value={value}
  onChange={setValue}
  placeholder="Select..."
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]}
/>
``` 