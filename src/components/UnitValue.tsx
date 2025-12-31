import { useState, useEffect, useRef } from "react";
import Tooltip from "./Tooltip";

const MINUS_ICON = (
  <svg
    width="12"
    height="2"
    viewBox="0 0 12 2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 0.75C0 0.335786 0.335786 0 0.75 0L11.25 0C11.6642 0 12 0.335786 12 0.75C12 1.16421 11.6642 1.5 11.25 1.5H0.75C0.335786 1.5 0 1.16421 0 0.75Z"
      fill="#F9F9F9"
    />
  </svg>
);
const PLUS_ICON = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.75 0.75C6.75 0.335786 6.41421 0 6 0C5.58579 0 5.25 0.335786 5.25 0.75V5.25H0.75C0.335786 5.25 0 5.58579 0 6C0 6.41421 0.335786 6.75 0.75 6.75H5.25L5.25 11.25C5.25 11.6642 5.58579 12 6 12C6.41421 12 6.75 11.6642 6.75 11.25V6.75H11.25C11.6642 6.75 12 6.41421 12 6C12 5.58579 11.6642 5.25 11.25 5.25H6.75V0.75Z"
      fill="#F9F9F9"
    />
  </svg>
);

const ButtonChangeValue = ({
  isDisabled,
  onClick,
  icon,
  tooltip,
  position,
  ariaLabel,
}: {
  isDisabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  position: "left" | "right";
  ariaLabel: string;
}) => {
  return (
    <Tooltip content={tooltip} enabled={isDisabled}>
      <button
        aria-label={ariaLabel}
        onClick={onClick}
        disabled={isDisabled}
        className={`bg-[#212121] flex items-center justify-center h-full aspect-square shrink-0 transition-colors cursor-pointer group-has-[.input-area:hover]:bg-[#3B3B3B]  ${
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-[#212121]!"
            : "hover:bg-[#3B3B3B]"
        } ${position === "left" ? "rounded-l-lg" : "rounded-r-lg"}`}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

export default function UnitValue() {
  const [unit, setUnit] = useState<"%" | "px">("%");
  const [value, setValue] = useState<number>(1.0);
  const [inputValue, setInputValue] = useState<string>("1.0");
  const [isFocused, setIsFocused] = useState(false);

  // Ref to store the value when input gets focus, to revert if needed
  const valueBeforeEditRef = useRef<number>(1.0);

  useEffect(() => {
    // Sync input value when numeric value changes (e.g. from buttons or unit switch)
    // We only update if the parsed input value is different to avoid cursor jumps if we were typing,
    // but here we only change value via buttons or blur, so syncing is safe.
    // However, to keep "1.0" format consistent:
    setInputValue(value.toString());
  }, [value]);

  const handleUnitChange = (newUnit: "%" | "px") => {
    setUnit(newUnit);
    if (newUnit === "%" && value > 100) {
      setValue(100);
    }
  };

  const handleDecrement = () => {
    if (value <= 0) return;
    setValue((prev) => {
      const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
      return next;
    });
  };

  const handleIncrement = () => {
    if (unit === "%" && value >= 100) return;
    setValue((prev) => Number((prev + 0.1).toFixed(1)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    valueBeforeEditRef.current = value;
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    let rawInput = inputValue;

    // Replace comma with dot
    rawInput = rawInput.replace(",", ".");
    console.log("🚀 ~ handleInputBlur ~ rawInput:", rawInput)

    // Parse float
    const parsed = parseFloat(rawInput);
    console.log("🚀 ~ handleInputBlur ~ parsed:", parsed)

    // Handle NaN (e.g. "a123" -> NaN)
    if (isNaN(parsed)) {
      // Logic: "a123 -> Convert to correct value closest when out focus"
      // If it's pure garbage, reverting to previous valid seems safest and standard.
      // However, "12a3" -> 12 (handled by parseFloat).
      // "12.4.5" -> 12.4 (handled by parseFloat).
      // If result is NaN, we revert.
      setValue(valueBeforeEditRef.current);
      setInputValue(valueBeforeEditRef.current.toString());
      return;
    }

    // Handle < 0 -> 0
    if (parsed < 0) {
      setValue(0);
      setInputValue("0");
      return;
    }

    // Handle % > 100
    if (unit === "%" && parsed > 100) {
      // "User enters > 100 and out focus will automatically jump to valid value before entering"
      setValue(valueBeforeEditRef.current);
      setInputValue(valueBeforeEditRef.current.toString());
      return;
    }

    // Commit valid value
    setValue(parsed);
    setInputValue(parsed.toString());
  };

  const isMinusDisabled = value <= 0;
  const isPlusDisabled = unit === "%" && value >= 100;

  const unitOptions: { label: string; value: "%" | "px" }[] = [
    {
      label: "%",
      value: "%",
    },
    {
      label: "px",
      value: "px",
    },
  ];

  return (
    <div
      className="bg-[#151515] flex flex-col gap-4 items-start p-4 relative w-72 rounded-lg"
      data-name="Unit value"
    >
      <div
        className="flex gap-2 items-center relative shrink-0 w-60"
        data-name="Setting Layout - Control & Action"
      >
        <div
          className="flex flex-1 gap-1 h-9 items-center relative shrink-0"
          data-name="Setting title"
        >
          <p className="font-sans font-normal leading-5 text-[#aaa] text-sm">
            Unit
          </p>
        </div>
        <div
          className="flex items-start relative shrink-0"
          data-name="Control / Option Control"
        >
          <div className="bg-[#212121] flex gap-0.5 items-start p-0.5 relative rounded-lg shrink-0 w-40">
            {unitOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleUnitChange(option.value)}
                className={`flex flex-1 h-8 items-center justify-center relative rounded-md shrink-0 transition-colors cursor-pointer ${
                  unit === option.value
                    ? "bg-[#3B3B3B] text-[#f9f9f9]"
                    : "text-[#aaa] hover:bg-[#3B3B3B]"
                }`}
              >
                <p className="font-medium leading-5 text-sm text-center">
                  {option.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex gap-2 items-center relative shrink-0 w-60"
        data-name="Setting Layout - Control & Action"
      >
        <div
          className="flex flex-1 gap-1 h-9 items-center relative shrink-0"
          data-name="Setting Title"
        >
          <p className="font-sans font-normal leading-5 text-[#aaa] text-sm">
            Value
          </p>
        </div>
        <div
          className={`group flex h-9 items-center relative rounded-lg shrink-0 w-40 transition-all duration-200 border ${
            isFocused ? "border-[#2E90FA]" : "border-transparent"
          }`}
        >
          <ButtonChangeValue
            isDisabled={isMinusDisabled}
            onClick={handleDecrement}
            icon={MINUS_ICON}
            tooltip={"Value must greater than 0"}
            position="left"
            ariaLabel="Decrease value"
          />

          <div className="flex flex-1 h-full items-center justify-center px-2 relative shrink-0 input-area bg-[#212121] hover:bg-[#3B3B3B]">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              className="w-full bg-transparent border-none outline-none font-normal leading-5 text-[#f9f9f9] text-sm text-center p-0 placeholder-[#555]"
            />
          </div>

          <ButtonChangeValue
            isDisabled={isPlusDisabled}
            onClick={handleIncrement}
            icon={PLUS_ICON}
            tooltip={"Value must smaller than 100"}
            position="right"
            ariaLabel="Increase value"
          />
        </div>
      </div>
    </div>
  );
}
