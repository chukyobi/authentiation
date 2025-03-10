import { type NextRequest, NextResponse } from "next/server"

// This is a simplified example - in a real app, you would have a complete database of states
const statesByCountry: Record<string, { name: string; code: string }[]> = {
  US: [
    { name: "Alabama", code: "AL" },
    { name: "Alaska", code: "AK" },
    { name: "Arizona", code: "AZ" },
    { name: "Arkansas", code: "AR" },
    { name: "California", code: "CA" },
    { name: "Colorado", code: "CO" },
    { name: "Connecticut", code: "CT" },
    { name: "Delaware", code: "DE" },
    { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" },
    // Add more states as needed
  ],
  CA: [
    { name: "Alberta", code: "AB" },
    { name: "British Columbia", code: "BC" },
    { name: "Manitoba", code: "MB" },
    { name: "New Brunswick", code: "NB" },
    { name: "Newfoundland and Labrador", code: "NL" },
    { name: "Nova Scotia", code: "NS" },
    { name: "Ontario", code: "ON" },
    { name: "Prince Edward Island", code: "PE" },
    { name: "Quebec", code: "QC" },
    { name: "Saskatchewan", code: "SK" },
    // Add territories if needed
  ],
  GB: [
    { name: "England", code: "ENG" },
    { name: "Scotland", code: "SCT" },
    { name: "Wales", code: "WLS" },
    { name: "Northern Ireland", code: "NIR" },
  ],
  // Add more countries as needed
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const country = searchParams.get("country")

  if (!country) {
    return NextResponse.json({ error: "Country parameter is required" }, { status: 400 })
  }

  const states = statesByCountry[country] || []

  return NextResponse.json({ states })
}

