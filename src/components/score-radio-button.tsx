import { Radio, ListItem, ListItemPrefix} from "@material-tailwind/react";
interface ScoreRadioButtonProps {
  name: string;
  label: string;
  value: string;
  scoreData: Record<string, string | number | null >;
  onChange: ( name: string, value: string) => void;
}

export function ScoreRadioButton({ name, label, value, scoreData, onChange }: ScoreRadioButtonProps) {
  const isChecked = scoreData[name] === value;
  return (
    
    
        <ListItem className="p-0">
          <label
            htmlFor={`${name}-${value}`}
            className="flex text-sm w-full cursor-pointer items-center px-3 py-2"
          >
            <ListItemPrefix className="mr-3">
              <Radio
                name={`${name}-${value}`}
                id={`${name}-${value}`}
                value={value}
                ripple={false}
                className="hover:before:opacity-0"
                crossOrigin=''
                checked={isChecked}
                onChange={()=> onChange(name, value)}
                containerProps={{
                  className: "p-0",
                }}
              />
            </ListItemPrefix>
            
              {label}
            
          </label>
        </ListItem>
        
      
    
  );
}

export default ScoreRadioButton
