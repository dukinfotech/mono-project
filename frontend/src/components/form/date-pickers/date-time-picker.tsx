"use client";

import { Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { format, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ValueDateType = Date | null | undefined;

export type DateTimePickerFieldProps = {
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

function DateTimePickerInput(
  props: DateTimePickerFieldProps & {
    name: string;
    value: ValueDateType;
    onChange: (value: ValueDateType) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const dateValue = props.value ?? null;
  const hours = dateValue ? dateValue.getHours() : "";
  const minutes = dateValue ? dateValue.getMinutes() : "";

  const handleTimeChange = (h: number, m: number) => {
    if (!dateValue) return;
    const newDate = setMinutes(setHours(dateValue, h), m);
    props.onChange(newDate);
  };

  return (
    <FormItem className={cn("flex flex-col space-y-2", props.className)} data-testid={props.testId}>
      <FormLabel htmlFor={props.name}>{props.label}</FormLabel>
      <FormControl>
        <div className="flex gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={props.disabled || props.readOnly}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue ?? undefined}
                onSelect={(d) => props.onChange(d)}
                fromDate={props.minDate}
                toDate={props.maxDate}
                disabled={props.disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Time Picker */}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              max={23}
              value={hours}
              disabled={props.disabled || props.readOnly}
              className="w-14"
              onChange={(e) => {
                const h = parseInt(e.target.value || "0", 10);
                handleTimeChange(h, minutes || 0);
              }}
            />
            :
            <Input
              type="number"
              min={0}
              max={59}
              value={minutes}
              disabled={props.disabled || props.readOnly}
              className="w-14"
              onChange={(e) => {
                const m = parseInt(e.target.value || "0", 10);
                handleTimeChange(hours || 0, m);
              }}
            />
          </div>
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

function FormDateTimePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: DateTimePickerFieldProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <DateTimePickerInput
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

export default FormDateTimePickerInput;
