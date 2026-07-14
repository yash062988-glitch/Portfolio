import { Html, useProgress } from '@react-three/drei';

export function Loading() {
  const { progress, active } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white text-sm font-medium">
          {active ? `${Math.round(progress)}%` : 'Complete'}
        </div>
      </div>
    </Html>
  );
}
