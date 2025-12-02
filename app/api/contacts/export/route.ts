import { NextResponse } from "next/server"
import { getContacts } from "@/app/contacts/data"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sp: Record<string, string> = Object.fromEntries(searchParams.entries())
  const contacts = await getContacts(sp)

  if (contacts.length === 0) {
    return new NextResponse("No data", { status: 200 })
  }

  const fields = Object.keys(contacts[0])
  const header = fields.join(",")

  const clean = (value: unknown) => {
    if (value === null || value === undefined) return ""
    return String(value).replace(/"/g, '""')
  }

  const rows = contacts
    .map(row =>
      fields
        .map(f => `"${clean((row as Record<string, unknown>)[f])}"`)
        .join(",")
    )
    .join("\n")

  const csv = "\uFEFF" + header + "\n" + rows

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contacts.csv"',
    },
  })
}
