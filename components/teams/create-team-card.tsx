"use client"

export default function CreateTeamCard() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-create-team-modal"))}
      className="
        w-56 p-4 rounded-lg text-center font-semibold text-blue-700
        bg-blue-50 border border-blue-200
        shadow-sm hover:shadow-md 
        hover:bg-blue-100
        transition-all duration-200
      "
    >
      + Create Team
    </button>
  )
}
