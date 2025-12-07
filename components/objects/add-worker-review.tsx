"use client"; // ← This makes it a Client Component (only this tiny one)

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import { addReview } from "@/app/objects/actions"

type Props = {
  workingonId: number
  contactName: string
}

export default function AddWorkerReview({ workingonId, contactName }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // If closed → just show a tiny button
  if (!isOpen) {
    return (
      <div className="mt-3 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Star className="w-4 h-4 mr-1" /> Leave a review for {contactName}
        </Button>
      </div>
    )
  }

  // If open → show the full form
  return (
    <Card className="mt-4 border-dashed">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">
            Rate <span className="font-semibold">{contactName}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>

        <form action={addReview} className="space-y-4">
          <input type="hidden" name="workingon_id" value={workingonId} />

          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  required
                  className="sr-only peer"
                />
                <Star
                  className="w-9 h-9 transition-all hover:scale-110 
                    fill-transparent stroke-yellow-600 
                    peer-checked:fill-yellow-500 peer-checked:stroke-yellow-600"
                />
              </label>
            ))}
          </div>

          <Textarea
            name="reviewtext"
            placeholder="Optional comment (quality, punctuality, communication…)"
            rows={2}
            className="resize-none text-sm"
          />

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}