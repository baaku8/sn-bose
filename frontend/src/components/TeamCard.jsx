export default function TeamCard({ team }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition">
      <h2 className="text-2xl font-bold">
        {team.teamName}
      </h2>

      <p className="mt-3 text-slate-400">
        {team.description}
      </p>

      <div className="mt-4 text-slate-300">
        Members:
        {" "}
        {team.members}
        /
        {team.maxMembers}
      </div>

      <button className="mt-6 w-full bg-blue-600 py-3 rounded-lg">
        View Details
      </button>
    </div>
  );
}