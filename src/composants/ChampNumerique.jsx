import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ChampNumerique({ value, onChange, min, max, step = 1, className = '', ...reste }) {
  const ajuster = (delta) => {
    const val = parseFloat(value) || 0;
    let nouveau = parseFloat((val + delta * step).toFixed(10));
    if (min !== undefined) nouveau = Math.max(nouveau, Number(min));
    if (max !== undefined) nouveau = Math.min(nouveau, Number(max));
    onChange({ target: { value: String(nouveau) } });
  };

  return (
    <div className="relative flex">
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={`${className} [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none pr-7`}
        {...reste}
      />
      <div className="absolute right-0 inset-y-0 flex flex-col border-l border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => ajuster(1)}
          tabIndex={-1}
          className="flex-1 flex items-center justify-center px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-tr-lg transition-colors"
        >
          <ChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => ajuster(-1)}
          tabIndex={-1}
          className="flex-1 flex items-center justify-center px-1 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 rounded-br-lg transition-colors"
        >
          <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
