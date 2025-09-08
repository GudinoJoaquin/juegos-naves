export default function Bullet({ x, y }) {
  return (
    <div
      className="w-2 h-6 bg-red-500 absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,  
      }}
    />
  );
}
