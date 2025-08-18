"use client";

import { Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export type SelectInputProps<T extends object> = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  keyValue: keyof T;
  options: T[];
  size?: "small" | "medium";
  renderOption: (option: T) => React.ReactNode;
};

function SelectInput<T extends object>(
  props: SelectInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
    ref?: Ref<HTMLButtonElement | null>;
  }
) {
  return (
    <FormItem className="w-full" data-testid={props.testId}>
      <FormLabel>{props.label}</FormLabel>
      <Select
        value={props.value?.[props.keyValue]?.toString() ?? ""}
        onValueChange={(val) => {
          const newValue = props.options.find(
            (option) => option[props.keyValue]?.toString() === val
          );
          if (!newValue) return;
          props.onChange(newValue);
        }}
        disabled={props.disabled}
      >
        <SelectTrigger ref={props.ref}>
          <SelectValue placeholder={`Select ${props.label}`} />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <SelectItem
              key={option[props.keyValue]?.toString()}
              value={option[props.keyValue]?.toString() ?? ""}
              data-testid={`${props.testId}-${option[props.keyValue]}`}
            >
              {props.renderOption(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {props.error && <FormMessage>{props.error}</FormMessage>}
    </FormItem>
  );
}

function FormSelectInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: SelectInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <SelectInput<T>
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          keyValue={props.keyValue}
          size={props.size}
        />
      )}
    />
  );
}

export default FormSelectInput;
