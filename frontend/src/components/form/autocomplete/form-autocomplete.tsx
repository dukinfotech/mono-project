"use client";

import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutocompleteInputProps<T> = {
  label: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  value: T | null;
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  getOptionLabel: (option: T) => string;
};

function AutocompleteInput<T>({
  label,
  disabled,
  readOnly,
  error,
  testId,
  value,
  options,
  onChange,
  renderOption,
  getOptionLabel,
}: AutocompleteInputProps<T> & {
  name: string;
  value: T | null;
  onChange: (value: T) => void;
  onBlur: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormItem className="w-full">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled || readOnly}
              data-testid={testId}
              className="w-full justify-between"
            >
              {value ? getOptionLabel(value) : "Select..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search..." autoFocus />
              <CommandEmpty>No result.</CommandEmpty>
              <CommandGroup>
                {options.map((option, idx) => {
                  const isSelected = value
                    ? getOptionLabel(option) === getOptionLabel(value)
                    : false;
                  return (
                    <CommandItem
                      key={idx}
                      onSelect={() => {
                        onChange(option);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderOption(option)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

function FormAutocompleteInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: AutocompleteInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <FormField
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <AutocompleteInput<T>
          {...field}
          label={props.label}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          getOptionLabel={props.getOptionLabel}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={props.name}
        />
      )}
    />
  );
}

export default FormAutocompleteInput;
