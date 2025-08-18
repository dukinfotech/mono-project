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
import { Badge } from "@/components/ui/badge";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export type MultipleSelectInputProps<T extends object> = {
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  keyValue: keyof T;
  options: T[];
  renderValue: (option: T[]) => React.ReactNode;
  renderOption: (option: T) => React.ReactNode;
};

function MultipleSelectInput<T extends object>(
  props: MultipleSelectInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLButtonElement | null>;
  }
) {
  const selectedKeys =
    props.value?.map((v) => v?.[props.keyValue]?.toString()) ?? [];

  const toggleValue = (selected: string) => {
    const option = props.options.find(
      (opt) => opt[props.keyValue]?.toString() === selected
    );
    if (!option) return;

    let newValue: T[];
    if (selectedKeys.includes(selected)) {
      newValue = (props.value ?? []).filter(
        (v) => v?.[props.keyValue]?.toString() !== selected
      );
    } else {
      newValue = [...(props.value ?? []), option];
    }
    props.onChange(newValue);
  };

  return (
    <FormItem className="w-full">
      <FormLabel>{props.label}</FormLabel>
      <FormControl>
        <Select
          onValueChange={toggleValue}
          value={undefined} // cho phép multi chọn => reset giá trị để dùng toggle
          disabled={props.disabled}
        >
          <SelectTrigger
            ref={props.ref as any}
            data-testid={props.testId}
            className="flex flex-wrap gap-1 min-h-[2.5rem]"
          >
            {props.value && props.value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {props.value.map((v) => (
                  <Badge
                    key={v[props.keyValue]?.toString()}
                    variant="secondary"
                  >
                    {props.renderOption(v)}
                  </Badge>
                ))}
              </div>
            ) : (
              <SelectValue placeholder="Select options..." />
            )}
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => {
              const key = option[props.keyValue]?.toString();
              return (
                <SelectItem key={key ?? ""} value={key ?? ""}>
                  {props.renderOption(option)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </FormControl>
      {props.error && (
        <FormMessage data-testid={`${props.testId}-error`}>
          {props.error}
        </FormMessage>
      )}
    </FormItem>
  );
}

function FormMultipleSelectInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: MultipleSelectInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <MultipleSelectInput<T>
          {...field}
          label={props.label}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          renderValue={props.renderValue}
          keyValue={props.keyValue}
        />
      )}
    />
  );
}

export default FormMultipleSelectInput;
