"use client"

export default function JoinTeamCard() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-join-team-modal"))}
      className="
        w-56 p-4 rounded-lg text-center font-semibold text-green-700
        bg-green-50 border border-green-200
        shadow-sm hover:shadow-md
        hover:bg-green-100
        transition-all duration-200
      "
    >
      + Join Team
    </button>
  )
}
