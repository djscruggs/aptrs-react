import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent,
  RefObject
} from 'react';

import {
  StyleTextfield,
  StyleTextfieldError,
  StyleLabel,
  FormErrorMessage,
  ModalErrorMessage
} from '../lib/formstyles'
import PageTitle from '../components/page-title';
import { withAuth } from "../lib/authutils";
import Button from '../components/button';
import ShowPasswordButton from '../components/show-password-button';
import { FormSkeleton } from '../components/skeletons'
import { getUser } from '../lib/data/api';
import { upsertUser, AuthUser} from '../lib/data/api';
import { User } from '../lib/data/definitions'
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import PermissionGroupSelect from '../components/permission-group-select';


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
  number?: {
    message: string;
  };
  groups?: {
    message: string;
  };
}

interface UserFormProps {
  id?: string; // Make the ID parameter optional
  forwardedRef?: RefObject<HTMLDialogElement> //handle to the modal this is loaded in
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>> //state function to tell parent to reload data
  onClose: () => void;
}
function UserForm({ id: userId, forwardedRef, setRefresh, onClose }: UserFormProps): JSX.Element {
  
  const [id, setId] = useState(userId)
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [saveError, setSaveError] = useState('');
  //extend User type to support password fields
  type UserForm = User & {
    password?: string;
    password_check?: string;
  };
  const [formData, setFormData] = useState<UserForm>({
    username: '',
    full_name: '',
    email: '',
    is_staff: false,
    is_active: false,
    is_superuser: false,
    number: '',
    company: AuthUser().company,
    position: '',
    password: '',
    password_check: '',
    groups: [],
  });
  //used in phone number input
  const defaultCountry = AuthUser().location.country 
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
    function handleInputChange(){
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
      console.log('loading')
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
  //needed a customer handler for phone number
  const handlePhoneInputChange = (value:string) => {
    setFormData({
      ...formData,
      number:value
    })    
  };
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = event.target;
    
    // Check the type of input - checkboxes don't have a value attribute
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));
  };
  const [passwordVisible, setPasswordVisible] = useState(false)
  function togglePasswordVisibility() {
    setPasswordVisible((prevState) => !prevState);
  }
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
    
    // FORM VALIDATION
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(formData?.email))) {
      newErrors.email = { message: 'Enter a valid email address' };
    }
    const phoneRegex = /^(\+[1-9]\d{0,2}-)?\d{1,14}$/;
    if (!phoneRegex.test(String(formData?.number))) {
      newErrors.number = { message: 'Enter a valid phone number with country code' };
    } else {
      console.log('phone number passed ', String(formData?.number))
    }
    if (Object.keys(newErrors).length >  0) {
      setErrors(newErrors);
      console.error('Form failed validation:', newErrors);
    } else {
      try {
        await upsertUser(formData as User);
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
  
  if(loading) return <FormSkeleton numInputs={6}/>
  if (loadingError) return <ModalErrorMessage message={"Error loading user"} />

  
  return (
    <div className="max-w-lg flex-1 rounded-lg">
      <PageTitle title={id ? "Edit User" : "Create User"} />
      {saveError && <FormErrorMessage message={saveError} />}
      
      <form onSubmit={handleSubmit} id="projectForm" method="POST">
        <div className="grid grid-cols-2 gap-3"> 
        <div>
          <div className="w-full mb-4">
            <label 
              htmlFor="full_name"
              className={StyleLabel}>
              Full name
            </label>
            <div className="relative">
              <input
                name="full_name"
                id="full_name"
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
              className={StyleLabel}
              htmlFor="email">
                Email
            </label>
            <div className="relative">
              <input
                name="email"
                id="email"
                className={StyleTextfield}
                value={formData.email}
                onChange={handleChange}
                type="text"
                required
              />
              {errors.email?.message && <FormErrorMessage message={errors.email.message} />}
            </div>
          </div>
        </div>
        <div>
        <div className="w-full mb-4">
          <label 
            htmlFor="name"
            className={StyleLabel}>
            Phone number
          </label>
          <div className="relative">
          <PhoneInput
              value={formData.number}
              onChange={handlePhoneInputChange}
              name="number"
              defaultCountry={defaultCountry}
              id="number"
              
              />
            {/* <input
              name="number"
              id="name"
              className={StyleTextfield}
              value={formData.number}
              onChange={handleChange}
              type="text"
            /> */}
            {errors.number?.message && <FormErrorMessage message={errors.number.message} />}
          </div>
        </div>
        <div className="w-full mb-4">
          <label 
            htmlFor="position"
            className={StyleLabel}>
            Position
          </label>
          <div className="relative">
            <input
              name="position"
              id="position"
              className={StyleTextfield}
              value={formData.position}
              onChange={handleChange}
              type="text"
              
            />
          </div>
        </div>
        
        
        </div>
        </div>
        <div className="flex">
          <fieldset className="mr-4 form-control rounded-md flex flex-col w-1/2 space-y-4 pb-4 pl-4 border border-slate-200" >
            <legend className='text-sm'>User Status</legend>
            <div className="flex items-center">
              <label 
                  htmlFor="is_active"
                  className='label cursor-pointer text-left'
                >
                  <input type="checkbox" 
                    name='is_active' 
                    id="is_active"
                    className='rounded-xl toggle toggle-accent mr-2'
                    onChange={handleChange}
                    checked={formData.is_active ? true : false} 
                    disabled = {AuthUser().username == formData.username }
                  />
                  {AuthUser().username === formData.username &&
                    <div className="tooltip tooltip-right" data-tip="You cannot disable for your own account"> 
                      <span className="label-text">Active</span> 
                    </div>
                  }
                  {AuthUser().username != formData.username &&
                    <span className="label-text">Active</span> 
                  }
                </label>  
            </div>
            <div className="flex items-center">
              <label 
                htmlFor="is_staff"
                className='label cursor-pointer'
              >
                <input type="checkbox" 
                name='is_staff' 
                id="is_staff"
                className='rounded-xl toggle toggle-accent mr-2'
                onChange={handleChange}
                checked={formData.is_staff ? true : false} 
                />
                <span className="label-text">Staff Member</span> 
              </label>
            
            </div>
            <div className="flex items-center mb-0 pb-0">
                <label 
                  htmlFor="is_superuser"
                  className='label cursor-pointer'
                >
                  <input type="checkbox" 
                  name='is_superuser'
                  id="is_superuser"
                  className='rounded-xl toggle toggle-accent mr-2'
                  onChange={handleChange}
                  checked={formData.is_superuser ? true : false} 
                  disabled = {AuthUser().username == formData.username || AuthUser().isAdmin == false  }
                />
                {AuthUser().username === formData.username &&
                  <div className="tooltip tooltip-right" data-tip="You cannot disable for your own account"> 
                    <span className="label-text">Administrator</span> 
                  </div>
                }
                {AuthUser().username != formData.username &&
                  <span className="label-text">Administrator</span> 
                }
                </label>
            </div>
            <div className="relative pr-2 pt-1">
                <label 
                  htmlFor="groups"
                  className='label pt-0'
                >
                  <span className="label-text">Permission Groups</span>
                </label>
                <PermissionGroupSelect 
                  name='groups'
                  id="groups"
                  value={formData.groups}
                  changeHandler={handleChange}
                  error={errors.groups ? true : false}
                />
            </div>
          </fieldset>
          <div className="flex flex-col w-1/2">
            <fieldset className="form-control rounded-md  space-y-2 p-2 border border-slate-200" >
              <legend className='text-sm'>{formData.id ? 'New Password (optional)' : 'Password'}</legend>
              <div className="w-full mt-0">
                <label 
                  htmlFor="password"
                  className='mt-0 mb-2 block text-xs font-medium text-gray-900'
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    id="password"
                    className={formData.password != formData.password_check ? `${StyleTextfieldError}` :`${StyleTextfield}`}
                    onChange={handleChange}
                    type={passwordVisible ? "text" : "password"}
                  />
                  <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
                </div>
                
                
              </div>
              <div className="w-full mt-0">
                <label 
                  htmlFor="password_check"
                  className='mt-0 mb-2 block text-xs font-medium text-gray-900'
                >
                  Repeat password
                </label>
                <div className="relative">
                  <input
                    name="password_check"
                    id="password_check"
                    className={formData.password != formData.password_check ? `${StyleTextfieldError}` :`${StyleTextfield}`}
                    onChange={handleChange}
                    type={passwordVisible ? "text" : "password"}
                  />
                  <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
                    
                </div>
                {formData.password != formData.password_check && <p className='text-xs mt-2 ml-1 text-red-500'>Passwords should match</p>}
              </div>
            </fieldset>
          </div>
        </div>
        
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


export default withAuth(UserForm);
