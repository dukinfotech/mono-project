"use client";

import { Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type ValueDateType = Date | null | undefined;

export type DatePickerFieldProps = {
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  readOnly?: boolean;
  label: string;
  testId?: string;
  error?: string;
  defaultValue?: ValueDateType;
};

function DatePickerInput(
  props: DatePickerFieldProps & {
    name: string;
    value: ValueDateType;
    onChange: (value: ValueDateType) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  return (
    <FormItem className={cn("flex flex-col space-y-2", props.className)} data-testid={props.testId}>
      <FormLabel htmlFor={props.name}>{props.label}</FormLabel>
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={props.disabled || props.readOnly}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !props.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {props.value ? format(props.value, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={props.value ?? undefined}
              onSelect={props.onChange}
              disabled={props.disabled}
              fromDate={props.minDate}
              toDate={props.maxDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormControl>
      {!!props.error && (
        <FormMessage data-testid={`${props.testId}-error`}>
          {props.error}
        </FormMessage>
      )}
    </FormItem>
  );
}

function FormDatePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: DatePickerFieldProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <DatePickerInput
          {...field}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          label={props.label}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          minDate={props.minDate}
          maxDate={props.maxDate}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export default FormDatePickerInput;
