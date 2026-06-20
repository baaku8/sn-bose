import { useParams } from "react-router-dom";

export default function ViewTeam() {
  const { id } = useParams();

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Team Dashboard</h2>
      <p className="text-neutral-400">Viewing dashboard for team ID: <span className="text-blue-400">{id}</span></p>
      {/* Build out your chat, tasks, and project view here */}
    </div>
  );
}