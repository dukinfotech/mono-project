"use client"

import * as React from "react"
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form"
import { format, setHours, setMinutes } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ValueDateType = Date | null | undefined
export type TimePickerFieldProps = {
  disabled?: boolean
  className?: string
  autoFocus?: boolean
  readOnly?: boolean
  label: string
  testId?: string
  error?: string
  defaultValue?: ValueDateType
  minTime?: Date
  maxTime?: Date
  stepMinutes?: number
  timeSteps?: {
    minutes?: number
  }
}

function TimePickerInput(
  props: TimePickerFieldProps & {
    name: string
    value: ValueDateType
    onChange: (value: ValueDateType) => void
    onBlur: () => void
  }
) {
  const step = props.stepMinutes ?? 30
  const selected = props.value ?? null

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 / step }, (_, i) => i * step)

  const handleHourChange = (h: string) => {
    const hour = parseInt(h)
    const newDate = selected ? setHours(selected, hour) : setHours(new Date(), hour)
    props.onChange(newDate)
  }

  const handleMinuteChange = (m: string) => {
    const minute = parseInt(m)
    const newDate = selected ? setMinutes(selected, minute) : setMinutes(new Date(), minute)
    props.onChange(newDate)
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{props.label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
            data-testid={props.testId}
          >
            {selected ? format(selected, "HH:mm") : "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 p-2">
          <Select
            disabled={props.disabled}
            onValueChange={handleHourChange}
            value={selected ? String(selected.getHours()) : ""}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((h) => (
                <SelectItem key={h} value={String(h)}>
                  {h.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            disabled={props.disabled}
            onValueChange={handleMinuteChange}
            value={selected ? String(selected.getMinutes()) : ""}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>
      {props.error && <p className="text-sm text-red-500">{props.error}</p>}
    </div>
  )
}

function FormTimePickerInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: TimePickerFieldProps &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <TimePickerInput
          {...field}
          defaultValue={props.defaultValue}
          autoFocus={props.autoFocus}
          label={props.label}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          error={fieldState.error?.message}
          minTime={props.minTime}
          maxTime={props.maxTime}
          stepMinutes={props.timeSteps?.minutes}
        />
      )}
    />
  )
}

export default FormTimePickerInput
