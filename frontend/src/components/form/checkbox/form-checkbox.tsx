"use client";

import { Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CheckboxInputProps<T> = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  keyValue: keyof T;
  options: T[];
  keyExtractor: (option: T) => string;
  renderOption: (option: T) => React.ReactNode;
};

function CheckboxInput<T>(
  props: CheckboxInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const value = props.value ?? [];
  const onChange = (checkboxValue: T) => () => {
    const isExist = value
      .map((option) => option[props.keyValue])
      .includes(checkboxValue[props.keyValue]);

    const newValue = isExist
      ? value.filter(
          (option) => option[props.keyValue] !== checkboxValue[props.keyValue]
        )
      : [...value, checkboxValue];

    props.onChange(newValue);
  };

  return (
    <div
      data-testid={props.testId}
      className={cn("space-y-2", props.disabled && "opacity-60 pointer-events-none")}
      ref={props.ref as any}
    >
      {props.label && (
        <Label data-testid={`${props.testId}-label`} className="mb-1 block">
          {props.label}
        </Label>
      )}
      <div className="flex flex-col gap-2">
        {props.options.map((option) => (
          <label
            key={props.keyExtractor(option)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={value
                .map((valueOption) => valueOption[props.keyValue])
                .includes(option[props.keyValue])}
              onCheckedChange={onChange(option)}
              name={props.name}
              disabled={props.disabled}
              data-testid={`${props.testId}-${props.keyExtractor(option)}`}
            />
            {props.renderOption(option)}
          </label>
        ))}
      </div>
      {!!props.error && (
        <p
          className="mt-1 text-xs text-destructive"
          data-testid={`${props.testId}-error`}
        >
          {props.error}
        </p>
      )}
    </div>
  );
}

function FormCheckboxInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: CheckboxInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <CheckboxInput<T>
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          keyValue={props.keyValue}
          keyExtractor={props.keyExtractor}
          renderOption={props.renderOption}
        />
      )}
    />
  );
}

export default FormCheckboxInput;