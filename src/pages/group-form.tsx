import { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent,
  useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  StyleCheckbox,

} from '../lib/formstyles'
import { WithAuth } from "../lib/authutils";
import { currentUserCan } from '../lib/utilities'
import Button from '../components/button';
import { upsertGroup, fetchPermisisons} from '../lib/data/api';
import { Group } from '../lib/data/definitions'
import toast from 'react-hot-toast';
interface FormErrors {
  name?: string
  description?: string
  list_of_permissions: string[];
}

interface Permission {
  name: string;
}

interface GroupFormProps {
  group: Group
  onSave: (group: Group) => void
  onClose: () => void;
}
function GroupForm(props: GroupFormProps): JSX.Element {
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [saveError, setSaveError] = useState('');
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate()
  if(!currentUserCan('Manage Group')){
    navigate('/access-denied')
  }
  
  const [formData, setFormData] = useState<Partial<Group>>(props.group);
  //logo input
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [permissions, setPermissions] = useState<string[]>([]);
  const initialized = useRef(false)
  
  useEffect(() => {


    const fetchData = async () => {
      try {
        const data = await fetchPermisisons();
        const permissionNames = data.map((permission: { name: string }) => permission.name);
        setPermissions(permissionNames);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };
    if (!initialized.current) {
      initialized.current = true
      fetchData();
    }

    // trap keydown events to see if the user has edited anything
    function handleKeyDown(e: KeyboardEvent) {
      if(e.key == 'Escape') {
        e.preventDefault()
        if(editing){
          if(!confirm('Quit without saving?')){
            return null;
          }
        } 
        closeModal()
      //if it's an input element, set editing to true
      } else if(e.target?.toString().includes('HTMLInput')) {
        setEditing(true)
      }
    }
    //set flag to true if an input eleent
    function handleInputChange(){
      setEditing(true)
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("change", handleInputChange);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("change", handleInputChange);
    };
  }, []);

  
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEditing(true); // Ensure setEditing is defined and used here
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
  
  //override skips the check for whether the user wants to save before closing
  const closeModal = (override = false) =>  {
    if(!override) {
      if(editing){
        if(!confirm('Quit without saving?')){
          return null;
        }
      }
    }
    props.onClose()
  }
  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    setBtnDisabled(true);
    event.preventDefault();
    // Perform your form validation here
    const newErrors: FormErrors = {};
    // Example validation logic (replace with your own)
    if (formData.name && formData.name.length < 3) {
      newErrors.name = 'Name should be at least three characters';
    }
    
    
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        const newGroup = await upsertGroup(formData as Group);
        props.onSave(newGroup)
        toast.success('Group saved.')
        setEditing(false)
        closeModal(true)
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
        // Handle error (e.g., show error message)
      }
    }
    setBtnDisabled(false);
  }

  const handlePermissionChange = (permissionName: string) => {
    setFormData((prevData) => {
      const newPermissions = prevData.list_of_permissions?.includes(permissionName)
        ? prevData.list_of_permissions.filter((p) => p !== permissionName)
        : [...(prevData.list_of_permissions || []), permissionName];
      return { ...prevData, list_of_permissions: newPermissions };
    });
  };
  
  
  
  return (
    <div className="max-w-xl min-w-lg flex-1 rounded-lg">
      
      <h1 className="mb-3 text-2xl dark:text-white">
        {formData.id ? "Edit" : "Create"} Group
      </h1>
      {saveError && <FormErrorMessage message={saveError} />}
      <form onSubmit={handleSubmit} id="projectForm" encType='multipart/form-data' method="POST">
        {/* Form inputs */}
        <div className="w-full mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Group Name
          </label>
          <div className="relative">
            <input
              name="name"
              id="name"
              className={StyleTextfield}
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.name && <FormErrorMessage message={errors.name} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Description
          </label>
          <div className="relative">
            <input
              name="description"
              id="description"
              className={StyleTextfield}
              value={formData.description}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.description && <FormErrorMessage message={errors.description} />}
          </div>
        </div>

        <div className="w-full mb-4">
        <label htmlFor="permissions" className={StyleLabel}>
          Select Permissions
        </label>
        <div className="relative">
          {permissions.map((permission) => (
            <div key={permission} className="mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className={StyleCheckbox}
                  checked={formData.list_of_permissions?.includes(permission) || false}
                  onChange={() => handlePermissionChange(permission)}
                />
                <span className="ml-2">{permission}</span>
              </label>
            </div>
          ))}
          {errors.list_of_permissions && (
            <span className="error">{errors.list_of_permissions}</span>
          )}
        </div>
      </div>
        
        
        {/* Submit button */}
        
        <div className="p-2 flex">
          <div className="w-1/2 flex justify-left">
                <Button 
                className="bg-primary disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                disabled={btnDisabled}
                type="submit">
                  Save
              </Button>
              <Button 
                className="bg-red-500 ml-1"
                onClick = {() => closeModal()}
                disabled={btnDisabled}>
                  Cancel
              </Button>
          </div>
      </div>
        
        
        
      </form>
    </div>
  );
}

export default WithAuth(GroupForm);
