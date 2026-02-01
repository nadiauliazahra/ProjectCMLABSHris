interface CardProps {
  title: string;
  value: number;
  color: string;
  update: string;
}

export default function Card({ title, value, color, update }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <h2 className="text-sm font-medium text-black">{title}</h2>
      <p className="text-2xl text-black font-bold">{value}</p>
      <span className={`mt-2 text-xs px-2 py-1 rounded text-white ${color}`}>
        Update: {update}
      </span>
    </div>
  );
}
