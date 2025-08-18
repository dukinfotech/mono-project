"use client";

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Ref } from "react";

import {
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type SwitchInputProps<T> = {
  label: string;
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

function SwitchInput<T>(
  props: SwitchInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const value = props.value ?? [];

  const onChange = (switchValue: T) => () => {
    const isExist = value
      .map((option) => option[props.keyValue])
      .includes(switchValue[props.keyValue]);

    const newValue = isExist
      ? value.filter(
          (option) => option[props.keyValue] !== switchValue[props.keyValue]
        )
      : [...value, switchValue];

    props.onChange(newValue);
  };

  return (
    <FormItem ref={props.ref} data-testid={props.testId} className="space-y-2">
      <FormLabel data-testid={`${props.testId}-label`}>
        {props.label}
      </FormLabel>
      <div className="space-y-2">
        {props.options.map((option) => (
          <div
            key={props.keyExtractor(option)}
            className="flex items-center space-x-2"
          >
            <Switch
              checked={value
                .map((val) => val[props.keyValue])
                .includes(option[props.keyValue])}
              onCheckedChange={onChange(option)}
              disabled={props.disabled}
              data-testid={`${props.testId}-${props.keyExtractor(option)}`}
            />
            <Label>{props.renderOption(option)}</Label>
          </div>
        ))}
      </div>
      {!!props.error && (
        <FormMessage data-testid={`${props.testId}-error`}>
          {props.error}
        </FormMessage>
      )}
    </FormItem>
  );
}

function FormSwitchInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: SwitchInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <SwitchInput<T>
          {...field}
          label={props.label}
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

export default FormSwitchInput;
