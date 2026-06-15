import TeamCard from "../components/TeamCard";

export default function Teams() {
  const teams = [
    {
      id: 1,
      teamName: "AI Resume Analyzer",
      description:
        "Looking for React and Node developers",
      members: 3,
      maxMembers: 5,
    },
    {
      id: 2,
      teamName: "Hackathon Team",
      description:
        "Need frontend developer and UI designer",
      members: 2,
      maxMembers: 4,
    },
    {
      id: 3,
      teamName: "Open Source Project",
      description:
        "Looking for MERN developers",
      members: 4,
      maxMembers: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Available Teams
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
          />
        ))}
      </div>
    </div>
  );
}