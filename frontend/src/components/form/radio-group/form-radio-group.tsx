"use client";

import { Ref, ReactNode } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export type RadioInputProps<T> = {
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
  renderOption: (option: T) => ReactNode;
};

function RadioInput<T>(
  props: RadioInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const value = props.value;

  return (
    <FormItem data-testid={props.testId}>
      <FormLabel data-testid={`${props.testId}-label`}>
        {props.label}
      </FormLabel>

      <RadioGroup
        ref={props.ref}
        value={value ? String(value[props.keyValue]) : ""}
        onValueChange={(val) => {
          const selected = props.options.find(
            (o) => String(o[props.keyValue]) === val
          );
          if (selected) props.onChange(selected);
        }}
        className="space-y-2"
      >
        {props.options.map((option) => {
          const key = props.keyExtractor(option);
          return (
            <FormItem
              key={key}
              className="flex items-center space-x-2"
            >
              <RadioGroupItem
                id={`${props.name}-${key}`}
                value={String(option[props.keyValue])}
                disabled={props.disabled}
                data-testid={`${props.testId}-${key}`}
              />
              <FormLabel
                htmlFor={`${props.name}-${key}`}
                className="cursor-pointer"
              >
                {props.renderOption(option)}
              </FormLabel>
            </FormItem>
          );
        })}
      </RadioGroup>

      {!!props.error && (
        <FormMessage data-testid={`${props.testId}-error`}>
          {props.error}
        </FormMessage>
      )}
    </FormItem>
  );
}

function FormRadioInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: RadioInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <RadioInput<T>
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

export default FormRadioInput;
