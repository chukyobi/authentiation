"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  defaultCountry?: string
}

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

// Sample country data - in a real app, you'd have a more complete list
const countries: Country[] = [
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
]

export default function PhoneInput({ value, onChange, defaultCountry = "US" }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    // Set default country on mount
    const country = countries.find((c) => c.code === defaultCountry) || countries[0]
    setSelectedCountry(country)

    // If there's an initial value, parse it
    if (value) {
      // Try to match the country code from the value
      const matchedCountry = countries.find((c) => value.startsWith(c.dialCode))
      if (matchedCountry) {
        setSelectedCountry(matchedCountry)
        setPhoneNumber(value.substring(matchedCountry.dialCode.length).trim())
      } else {
        setPhoneNumber(value)
      }
    }
  }, [defaultCountry, value])

  // Update the combined value whenever country or number changes
  useEffect(() => {
    if (selectedCountry) {
      onChange(`${selectedCountry.dialCode} ${phoneNumber}`.trim())
    }
  }, [selectedCountry, phoneNumber, onChange])

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, spaces, and dashes
    const cleaned = e.target.value.replace(/[^\d\s-]/g, "")
    setPhoneNumber(cleaned)
  }

  return (
    <div className="flex">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-[110px] justify-between mr-2 pl-3 pr-1.5">
            {selectedCountry ? (
              <>
                <span className="mr-1">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </>
            ) : (
              "Select"
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      setSelectedCountry(country)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        country.code === selectedCountry?.code ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="mr-2">{country.flag}</span>
                    {country.name} ({country.dialCode})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="Phone number"
        className="flex-1"
      />
    </div>
  )
}

