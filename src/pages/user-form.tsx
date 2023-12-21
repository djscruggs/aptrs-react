import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent,
  RefObject
} from 'react';

import {
  StyleTextfield,
  StyleLabel,
  FormErrorMessage,
  ModalErrorMessage
} from '../lib/formstyles'
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import { FormSkeleton } from '../components/skeletons'
import { getUser } from '../lib/data/api';
import { upsertUser} from '../lib/data/api';
import { User } from '../lib/data/definitions'
import toast from 'react-hot-toast';
interface FormErrors {
  username?: {
    message: string;
  };
  email?: {
    message: string;
  };
  full_name?: {
    message: string;
  };
  position?: {
    message: string;
  };
  company?: {
    message: string;
  };
}

interface UserFormProps {
  id?: string; // Make the ID parameter optional
  forwardedRef?: RefObject<HTMLDialogElement> //handle to the modal this is loaded in
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>> //state function to tell parent to reload data
  onClose: () => void;
}
function CompanyForm({ id: userId, forwardedRef, setRefresh, onClose }: UserFormProps): JSX.Element {
  const [id, setId] = useState(userId)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState<User>({
    username: '',
    full_name: '',
    email: '',
    is_staff: false,
    is_active: false,
    is_superuser: false,
    number: '',
    company: '',
    position: '',
    groups: [],
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  useEffect(() => {
    let editing: Boolean; //flag to track whether the form has been edited
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
        editing = true;
      }
    }
    //set flag to true if an input eleent
    function handleInputChange(e: Event){
      editing = true;
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("change", handleInputChange);

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("change", handleInputChange);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setLoading(true);
        try {
          const userData = await getUser(id) as User;
          
          setFormData(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoadingError(true);
          // Handle error fetching data
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [id]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
      console.log('name', name)
      console.log('checked', checked)
    // Check the type of input - checkboxes don't have a value attribute
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));
  };
  const closeModal = () =>  {
    setId('')
    if(forwardedRef?.current ) {
      forwardedRef.current.close()
    }
    onClose()
  }
  const handleSubmit = async(event: FormEvent<HTMLFormElement>) => {
    setBtnDisabled(true);
    event.preventDefault();
    // Perform your form validation here
    const newErrors: FormErrors = {};
    // Example validation logic (replace with your own)
    if (formData.email && formData.email.length < 3) {
      newErrors.email = { message: 'Name should be at least three characters' };
    }
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        const response = await upsertUser(formData as User);
        toast.success('User saved.')
        if(setRefresh){
          setRefresh(true)
        }
        closeModal()
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error submitting form:', error);
        setSaveError(String(error))
        // Handle error (e.g., show error message)
      }
    }
    setBtnDisabled(false);
  }
  
  if(loading) return <FormSkeleton numInputs={3}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading user"} />


  return (
    <div className="max-w-lg flex-1 rounded-lg">
      
      <h1 className="mb-3 text-2xl">
        {id ? "Edit" : "Create"} User
      </h1>
      {saveError && <FormErrorMessage message={saveError} />}
      <form onSubmit={handleSubmit} id="projectForm" method="POST">
        {/* Form inputs */}
        <div className="w-full mb-4">
          <label 
            htmlFor="full_name"
            className={StyleLabel}>
            Full name
          </label>
          <div className="relative">
            <input
              name="name"
              className={StyleTextfield}
              value={formData.full_name}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.username?.message && <FormErrorMessage message={errors.username.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            htmlFor="username"
            className={StyleLabel}>
            Username
          </label>
          <div className="relative">
            <input
              name="name"
              className={StyleTextfield}
              value={formData.username}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.username?.message && <FormErrorMessage message={errors.username.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            className={StyleLabel}
            htmlFor="email">
              Email
          </label>
          <div className="relative">
            <input
              name="address"
              className={StyleTextfield}
              value={formData.email}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.email?.message && <FormErrorMessage message={errors.email.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Company
          </label>
          <div className="relative">
            <input
              name="company"
              className={StyleTextfield}
              value={formData.username}
              onChange={handleChange}
              type="text"
              required
            />
            {errors.company?.message && <FormErrorMessage message={errors.company.message} />}
          </div>
        </div>
        <fieldset className="form-control rounded-md flex flex-col w-1/2 space-y-4 pb-4 pl-4 border border-slate-200" >
          <legend className='text-sm'>User Status</legend>
          <div className="flex items-center">
          <label 
              htmlFor="is_active"
              className='label cursor-pointer text-left'
            >
            
            <input type="checkbox" 
              name='is_active' 
              className='rounded-xl toggle toggle-accent mr-2'
              onChange={handleChange}
              checked={formData.is_active ? true : false} 
            />
            
              <span className="label-text text-left">Active</span> 
            </label>  
            
          </div>
          <div className="flex items-center">
            <label 
              htmlFor="is_staff"
              className='label cursor-pointer'
            >
              <input type="checkbox" 
              name='is_staff' 
              className='rounded-xl toggle toggle-accent mr-2'
              onChange={handleChange}
              checked={formData.is_staff ? true : false} 
            />
             <span className="label-text">Staff Member</span> 
            </label>
          </div>
          <div className="flex items-center">
            <label 
              htmlFor="is_staff"
              className='label cursor-pointer'
            >
              
              <input type="checkbox" 
              name='is_superuser' 
              className='rounded-xl toggle toggle-accent mr-2'
              onChange={handleChange}
              checked={formData.is_superuser ? true : false} 
            />
              <span className="label-text">Administrator</span> 
            </label>
          </div>
        </fieldset>
        <div className="w-full mb-4">
          <label 
              className={StyleLabel}
              htmlFor="img">
              Image
          </label>
          {/* <div className="relative">
            <input
              name="img"
              className={StyleTextfield}
              value={formData.img}
              onChange={handleChange}
              type="text"
            />
            {errors.img?.message && <FormErrorMessage message={errors.img.message} />}
          </div> */}
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
                onClick = {closeModal}
                disabled={btnDisabled}>
                  Cancel
              </Button>
          </div>
      </div>
        
        
        
      </form>
    </div>
  );
}

export default withAuth(CompanyForm);
