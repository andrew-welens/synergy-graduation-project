import { type ReactElement } from 'react'
import DatePicker from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  placeholder?: string
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

export const AppDateRangePicker = ({ from, to, onChange, placeholder }: DateRangePickerProps): ReactElement => {
  return (
    <DatePicker
      selected={toDate(from)}
      onChange={(dates) => {
        const [start, end] = dates as [Date | null, Date | null]
        onChange(toValue(start), toValue(end))
      }}
      startDate={toDate(from)}
      endDate={toDate(to)}
      selectsRange
      dateFormat="dd.MM.yyyy"
      placeholderText={placeholder ?? 'Выберите период'}
      className="input"
      calendarClassName="date-picker"
      popperClassName="date-picker-popper"
      showPopperArrow={false}
      isClearable
      locale={ru}
    />
  )
}
