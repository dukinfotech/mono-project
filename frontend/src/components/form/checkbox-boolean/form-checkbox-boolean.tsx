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
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export type CheckboxBooleanInputProps = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
};

function CheckboxBooleanInput(
  props: CheckboxBooleanInputProps & {
    name: string;
    value: boolean | null;
    onChange: (value: boolean) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const value = props.value ?? false;

  const onChange = (checked: boolean) => {
    props.onChange(checked);
  };

  return (
    <FormItem className="flex flex-col space-y-2" data-testid={props.testId}>
      <FormLabel htmlFor={props.name}>{props.label}</FormLabel>
      <FormControl>
        <div className="flex items-center space-x-2" ref={props.ref}>
          <Checkbox
            id={props.name}
            checked={value}
            onCheckedChange={onChange}
            disabled={props.disabled || props.readOnly}
            data-testid={`${props.testId}-checkbox`}
          />
        </div>
      </FormControl>
      {!!props.error && (
        <FormMessage data-testid={`${props.testId}-error`}>
          {props.error}
        </FormMessage>
      )}
    </FormItem>
  );
}

function FormCheckboxBooleanInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: CheckboxBooleanInputProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <CheckboxBooleanInput
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
        />
      )}
    />
  );
}

export default FormCheckboxBooleanInput;
