import { type ReactElement } from 'react'
import DatePicker from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minDate?: string
  maxDate?: string
}

const toDate = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const toValue = (date: Date | null) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const AppDatePicker = ({ value, onChange, placeholder, minDate, maxDate }: DatePickerProps): ReactElement => {
  return (
    <DatePicker
      selected={toDate(value)}
      onChange={(date: Date | null) => onChange(toValue(date))}
      dateFormat="dd.MM.yyyy"
      placeholderText={placeholder ?? 'дд.мм.гггг'}
      className="input"
      calendarClassName="date-picker"
      popperClassName="date-picker-popper"
      showPopperArrow={false}
      isClearable
      locale={ru}
      minDate={minDate ? toDate(minDate) ?? undefined : undefined}
      maxDate={maxDate ? toDate(maxDate) ?? undefined : undefined}
    />
  )
}
