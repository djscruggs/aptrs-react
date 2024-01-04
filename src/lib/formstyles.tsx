import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FormErrorMessageProps {
  message: string;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  return (
    <>
      <p className='text-sm text-red-500'>
        <ExclamationCircleIcon className='inline h-5 w-5 mr-1 text-red-500' />
        {message}
      </p>
    </>
  );
};

export const ModalErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  return (
    <>
      <p className='text-lg text-red-500'>
        <ExclamationCircleIcon className='inline w-5 mr-1 text-red-500' />
        {message}
      </p>
    </>
  );
};



export const StyleTextfield ='peer block w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500';
export const StyleTextfieldError ='peer block w-full rounded-md border border-2 border-rose-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500 focus:outline-none';
export const StyleCheckbox ="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2";

export const StyleLabel = 'mb-3 mt-5 block text-xs font-medium text-gray-900'






interface CustomRadioButtonProps {
  name: string;
  label: string;
  value: string | number;
  scoreData: Record<string, string | number | null >;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
}

export const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ name, label, value, scoreData, onClick }) => {
  const isChecked = scoreData[name] === value;
  return (
    <div
      role="button"
      className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
    >
      <label htmlFor={`vertical-list-${value}`} className="flex items-center w-full px-3 py-2 cursor-pointer">
        <div className="grid mr-3 place-items-center">
          <div className="inline-flex items-center">
            <label className="relative flex items-center p-0 rounded-full cursor-pointer" htmlFor={`vertical-list-${value}`}>
              <input
                name={name}
                id={`${name}-${value}`}
                type="radio"
                value={value}
                checked={isChecked}
                onClick={onClick}
                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-gray-900 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:before:bg-gray-900 hover:before:opacity-0"
              />
              <span className="absolute text-gray-900 transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <circle data-name="ellipse" cx="8" cy="8" r="8"></circle>
                </svg>
              </span>
            </label>
          </div>
        </div>
        <p className="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-400">{label}</p>
      </label>
    </div>
  );
};