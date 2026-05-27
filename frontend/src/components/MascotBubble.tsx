interface MascotBubbleProps {
  image: string;
  message: string;
  flip?: boolean;
}

export default function MascotBubble({ image, message, flip = false }: MascotBubbleProps) {
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Speech bubble */}
      <div className="relative bg-white border-2 border-[#ff6b00] rounded-2xl px-6 py-4 shadow-md max-w-[320px]">
        <p className="text-lg font-bold text-gray-700 leading-snug text-center whitespace-pre-line">{message}</p>
        {/* Bubble tail pointing down */}
        <div
          className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#ff6b00] rotate-45"
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        />
      </div>

      {/* Mascot image */}
      <img
        src={image}
        alt="mascot"
        draggable={false}
        className="w-[500px] h-[500px] object-contain"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      />
    </div>
  );
}
