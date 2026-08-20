'use client'

import { useState } from 'react'
import { ChevronDownIcon, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface DateTimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    time: string
    setTime: (time: string) => void
    timezone?: string
    setTimezone?: (timezone: string) => void
}

const fallbackTimeZones = [
    'Africa/Lagos',
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
]

function getTimeZoneOptions() {
    if (typeof Intl.supportedValuesOf === 'function') {
        return Intl.supportedValuesOf('timeZone')
    }

    return fallbackTimeZones
}

function formatTimeZoneLabel(timezone: string) {
    const cityName = timezone.split('/').pop()?.replaceAll('_', ' ') ?? timezone

    try {
        const timezoneName = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'shortOffset',
        })
            .formatToParts(new Date())
            .find((part) => part.type === 'timeZoneName')?.value

        return timezoneName ? `${cityName} (${timezoneName.replace('GMT', 'UTC')})` : cityName
    } catch {
        return cityName
    }
}

export function DateTimePicker({ date, setDate, time, setTime, timezone, setTimezone }: DateTimePickerProps) {
    const [open, setOpen] = useState(false)
    const timeZoneOptions = getTimeZoneOptions()

    return (
        <div className='grid w-full gap-4 md:grid-cols-3'>
            <div className='flex flex-col gap-2 w-full'>
                <Label htmlFor='date-picker'>Date</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant='outline'
                            id='date-picker'
                            className={cn(
                                'w-full justify-between px-3 text-left font-normal',
                                !date && 'text-muted-foreground'
                            )}
                        >
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='h-4 w-4 opacity-50' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                            mode='single'
                            selected={date}
                            onSelect={(newDate) => {
                                setDate(newDate)
                                setOpen(false)
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className='flex flex-col gap-2 w-full'>
                <Label htmlFor='time-picker'>Time</Label>
                <Input
                    type='time'
                    id='time-picker'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className='bg-background'
                />
            </div>
            {timezone !== undefined && setTimezone && (
                <div className='flex flex-col gap-2 w-full'>
                    <Label htmlFor='timezone-picker'>Timezone</Label>
                    <select
                        id='timezone-picker'
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        className='border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    >
                        {timeZoneOptions.map((timeZone) => (
                            <option key={timeZone} value={timeZone}>
                                {formatTimeZoneLabel(timeZone)}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    )
}
