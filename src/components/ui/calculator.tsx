import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Draggable from "react-draggable";

interface CalculatorProps {
  onClose: () => void;
}

export function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const percentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  return (
    <Draggable handle=".calculator-header">
      <div className="fixed top-20 right-4 z-50">
        <Card className="w-64 bg-white shadow-xl border-2">
          <div className="calculator-header cursor-move bg-blue-500 text-white p-2 rounded-t-lg flex items-center justify-between">
            <span className="text-sm font-medium">Calculator</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-white hover:bg-blue-600"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-3">
            {/* Display */}
            <div className="bg-gray-100 p-3 rounded text-right text-xl font-mono">
              {display}
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={clear}
              >
                MC
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={clear}
              >
                MR
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={clear}
              >
                MS
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={clear}
              >
                M+
              </Button>

              {/* Row 2 */}
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={clear}
              >
                M-
              </Button>
              <Button 
                variant="destructive" 
                className="h-10 text-xs"
                onClick={toggleSign}
              >
                ←
              </Button>
              <Button 
                variant="destructive" 
                className="h-10 text-xs"
                onClick={clear}
              >
                C
              </Button>
              <Button 
                variant="destructive" 
                className="h-10 text-xs"
                onClick={percentage}
              >
                +/-
              </Button>

              {/* Row 3 */}
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("7")}
              >
                7
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("8")}
              >
                8
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("9")}
              >
                9
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={() => performOperation("/")}
              >
                /
              </Button>

              {/* Row 4 */}
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("4")}
              >
                4
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("5")}
              >
                5
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("6")}
              >
                6
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={() => performOperation("*")}
              >
                *
              </Button>

              {/* Row 5 */}
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("1")}
              >
                1
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("2")}
              >
                2
              </Button>
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("3")}
              >
                3
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={() => performOperation("-")}
              >
                -
              </Button>

              {/* Row 6 */}
              <Button 
                variant="outline" 
                className="h-10"
                onClick={() => inputNumber("0")}
              >
                0
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={inputDot}
              >
                .
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-xs"
                onClick={() => performOperation("+")}
              >
                +
              </Button>
              <Button 
                variant="default" 
                className="h-10 text-xs bg-green-600 hover:bg-green-700"
                onClick={handleEquals}
              >
                =
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Draggable>
  );
}