"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectOrInputProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string; // Propriedade id adicionada
}

const OTHER_VALUE = "---outro---";

export function SelectOrInput({ options, value, onChange, placeholder, id }: SelectOrInputProps) {
  const [isCustomInput, setIsCustomInput] = useState(false);

  useEffect(() => {
    if (value && !options.includes(value)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCustomInput(true);
    } else if (value && options.includes(value)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCustomInput(false);
    }
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === OTHER_VALUE) {
      setIsCustomInput(true);
      onChange("");
    } else {
      setIsCustomInput(false);
      onChange(newValue);
    }
  };

  const selectedValue = isCustomInput ? OTHER_VALUE : (value || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
  <div className="space-y-2 bg-accent/20 rounded-md p-2">
      <Select onValueChange={handleSelectChange} value={selectedValue}>
        {/* O id é passado para o SelectTrigger para se conectar à Label */}
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
          <SelectItem value={OTHER_VALUE}>Outro...</SelectItem>
        </SelectContent>
      </Select>

      {selectedValue === OTHER_VALUE && (
        <Input
          placeholder="Escreva a sua opção aqui..."
          value={value}
          onChange={handleInputChange}
          className="mt-2"
        />
      )}
    </div>
  );
}