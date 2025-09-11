export default function GameModal({ visible, message, onRestart }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-2xl w-96 text-center">
        <h2 className="text-3xl font-bold mb-4">{message}</h2>
        <button
          onClick={onRestart}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-lg"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
