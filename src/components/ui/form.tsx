import { cn } from "@/lib/utils";
import { Card, CardBody } from "./card";
import { SubmitButton } from "./submit-button";

/**
 * Standard form scaffold used across every management screen.
 * Replaces ~35 hand-rolled `grid gap-4 sm:grid-cols-2` blocks so spacing,
 * heading hierarchy and the submit affordance are identical everywhere.
 */
export function FormCard({
  title,
  description,
  action,
  children,
  submitLabel,
  pendingLabel,
  secondaryAction,
  columns = 2,
  className,
}: {
  title?: string;
  description?: string;
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  secondaryAction?: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardBody>
        {title && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p>
            )}
          </div>
        )}
        <form action={action} className="space-y-4">
          <FormGrid columns={columns}>{children}</FormGrid>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
            {secondaryAction}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

/** Responsive field grid. Use `<FormRow full>` for full-width fields. */
export function FormGrid({
  columns = 2,
  children,
  className,
}: {
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  const cols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns];
  return <div className={cn("grid gap-4", cols, className)}>{children}</div>;
}

/** Spans the full width of a FormGrid. */
export function FormRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("sm:col-span-2 lg:col-span-3", className)}>{children}</div>;
}

/** Accessible checkbox row with a proper label association. */
export function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
  id,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  id?: string;
}) {
  const inputId = id ?? `cb-${name}`;
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={inputId}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 rounded border-ink-300 accent-brand-600"
      />
      <label htmlFor={inputId} className="text-sm">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="block text-xs text-[var(--muted)]">{description}</span>
        )}
      </label>
    </div>
  );
}
